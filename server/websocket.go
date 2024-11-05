package server

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	GridHeight = 17
	GridWidth  = 15
)

// Buffers for the messages
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// Declare a mutex to safely manage the list of connected clients and their usernames
var (
	clientsMutex sync.Mutex
	usersMutex   sync.Mutex
	writeMutex   sync.Mutex
)

type Server struct {
	clients          map[*websocket.Conn]bool   // Connections
	usernames        map[string]*websocket.Conn // Link between usernames and connection points
	gamestate        Gamestate
	stopGameLoop     chan struct{}
	startTimer       *time.Timer
	countdownControl *CountdownControl
	clientsMutex     sync.Mutex
}

type WebSocketUpdate struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func NewServer() *Server {
	return &Server{
		clients:   make(map[*websocket.Conn]bool),
		usernames: make(map[string]*websocket.Conn),
	}
}

func lockedWriteToConnection(conn *websocket.Conn, message WebSocketUpdate) error {
	writeMutex.Lock()
	defer writeMutex.Unlock()
	err := conn.WriteJSON(message)
	if err != nil {
		return err
	}
	return nil
}

// Function to handle WebSocket close event
func (s *Server) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error upgrading WebSocket: ", err)
		return
	}

	fmt.Println("Connection established:", conn.RemoteAddr())

	clientsMutex.Lock()
	s.clients[conn] = true
	clientsMutex.Unlock()

	defer s.closeConnection(conn)

	s.readLoop(conn)
}

// closes websocket connection safely
func (s *Server) closeConnection(conn *websocket.Conn) {
	clientsMutex.Lock()
	usersMutex.Lock()
	username, err := s.getUsername(conn)
	if err != nil {
		fmt.Println("Error closing the connection:", err)
	}
	delete(s.clients, conn)
	delete(s.usernames, username)
	clientsMutex.Unlock()
	usersMutex.Unlock()
	conn.Close()
	s.gamestate.RemovePlayer(username)
	fmt.Printf("User disconnected: %s\n", username)
	s.sendUpdatedUserList()
}

// Function to send the updated userlist to all clients, excluding the disconnected user
func (s *Server) sendUpdatedUserList() {
	usersMutex.Lock()
	defer usersMutex.Unlock()

	// creates a list of users to send to clients
	var usernames []string
	for username := range s.usernames {
		if s.usernames[username] != nil {
			usernames = append(usernames, username)
		}
	}

	updateMessage := WebSocketUpdate{
		Type: "userlist",
		Data: usernames,
	}

	s.broadcast(updateMessage)
}

// sends a message to every connection
func (s *Server) broadcast(updateMessage WebSocketUpdate) {
	writeMutex.Lock()
	defer writeMutex.Unlock()

	// Create a copy of the clients map
	s.clientsMutex.Lock()
	clients := make(map[*websocket.Conn]bool, len(s.clients))
	for conn := range s.clients {
		clients[conn] = true
	}
	s.clientsMutex.Unlock()

	// Iterate over the copy and send messages
	for client := range clients {
		err := client.WriteJSON(updateMessage)
		if err != nil {
			log.Println("Error sending updated userlist to client:", err)
		}
	}
}

func (s *Server) readLoop(conn *websocket.Conn) {
	// Handle WebSocket messages
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Println("Error reading message:", err)
			return
		}
		// fmt.Printf("Received message: %s\n", p)

		if messageType == websocket.TextMessage {
			var message map[string]interface{}
			if err := json.Unmarshal(p, &message); err != nil {
				log.Println(err)
				continue
			}
			messageType, ok := message["type"].(string)
			if !ok {
				log.Println("Invalid message format")
				continue
			}
			switch messageType {
			case "username":
				s.handleUsernameMessage(conn, message)
			case "message":
				username := s.findUser(conn)
				if username == "" {
					fmt.Println("invalid username")
					break
				}

				chatMessage := WebSocketUpdate{
					Type: "chatMessage",
					Data: fmt.Sprintf("%s: %s", username, message["data"]),
				}
				s.broadcast(chatMessage)
			case "gamestate":
				s.gamestateHandler(message["data"], conn)
			case "ready":
				s.readyHandler(message["data"], conn)
			case "start":
				go s.startGameLoop()
			case "bomb":
				s.gamestate.appendBombs(message["data"])
			case "death":
				isEnd := s.checkEnd(message["data"].(string))
				if isEnd {
					close(s.stopGameLoop)
					s.startTimer = nil
					s.sendVictory()
					s.gamestate.IsActive = false
				}
			case "explosion":
				s.RandomPowerup(message["data"])
			}
		}
	}
}

func (s *Server) findUser(conn *websocket.Conn) string {
	for user := range s.usernames {
		if s.usernames[user] != conn {
			continue
		}
		return user
	}
	return ""
}

// Function to handle "username" message type
func (s *Server) handleUsernameMessage(conn *websocket.Conn, message map[string]interface{}) {
	username, ok := message["data"].(string)
	if !ok {
		log.Println("Invalid username data")
		return
	}

	// Check if the server is full
	if len(s.usernames) >= 4 {
		// Send an error message to the client
		errorMessage := WebSocketUpdate{
			Type: "error",
			Data: "Server is full",
		}
		err := lockedWriteToConnection(conn, errorMessage)
		if err != nil {
			log.Println("Error sending error message to client:", err)
		}
		return
	}

	// Check if the username is already in use
	usersMutex.Lock()
	if _, ok := s.usernames[username]; ok {
		// Send an error message to the client
		errorMessage := WebSocketUpdate{
			Type: "error",
			Data: "Username already in use",
		}
		err := lockedWriteToConnection(conn, errorMessage)
		if err != nil {
			log.Println("Error sending error message to client:", err)
		}
		usersMutex.Unlock()
		return
	}

	// if unique name, add to the server name list
	s.usernames[username] = conn
	fmt.Printf("Added user: %s\n", username)
	usersMutex.Unlock()

	s.sendUpdatedUserList()
}

func (s *Server) getUsername(conn *websocket.Conn) (string, error) {
	for username, connAddr := range s.usernames {
		if connAddr == conn {
			return username, nil
		}
	}
	return "", fmt.Errorf("user not found")
}

func (s *Server) checkEnd(username string) bool {
	gamestateMutex.Lock()
	defer gamestateMutex.Unlock()
	delete(s.gamestate.Players, username)
	if len(s.gamestate.Players) < 2 {
		return true
	}
	return false
}

func (s *Server) sendVictory() {
	winner := getPlayerNames(s.gamestate.Players)[0]

	updateMessage := WebSocketUpdate{
		Type: "gameend",
		Data: winner,
	}
	s.broadcast(updateMessage)
}

func (s *Server) gamestateHandler(data interface{}, conn *websocket.Conn) {
	// fmt.Printf("gamestate handler: %v\n", data)

	player := s.findUser(conn)

	s.gamestate.UpdateGamestate(player, data)
}

func (s *Server) readyHandler(data interface{}, conn *websocket.Conn) {
	username, ok := data.(string)
	if !ok {
		log.Println("shits fucked")
	}

	// if the game is already running, return without doing anything
	if s.gamestate.IsActive {
		return
	}

	s.gamestate.AddNewPlayer(username)
	checkForStart(s.gamestate.Players, s)

	s.gamestate.createPlayArea(20, 20)
	updateMessage := WebSocketUpdate{
		Type: "readystate",
		Data: s.gamestate,
	}

	err := lockedWriteToConnection(conn, updateMessage)
	if err != nil {
		log.Println("Error sending updated gamestate to client:", err)
	}

	// fmt.Println(updateMessage)
}
