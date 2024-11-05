package server

import (
	// "encoding/json"
	"fmt"
	"log"
	"math/rand"
	"sync"
)

const (
	// incrimented values of buffs using iota
	buffInvisibility  uint8 = 1 << iota // 00000001
	buffSpeedBoost                      // 00000010
	buffDoublePower                     // 00000100
	buffInvincibility                   // 00001000
)

const (
	// These numbers define the max values for players.
	// TODO: finalize numbers, these are pulled out of my ass atm
	maxBombs  uint8 = 6
	maxFlames uint8 = 10
	maxSpeed  uint8 = 6
)

var gamestateMutex sync.Mutex

type Gamestate struct {
	Players  map[string]PlayerState `json:"players"`
	PlayArea []int                  `json:"playArea"`
	Bodies   []PlayerState          `json:"bodies"`
	Bombs    [][]int                `json:"bombs"`
	IsActive bool                   `json:"-"`
}

type Bombs struct {
	amount uint8
	flames uint8
}

type PlayerState struct {
	PlayerIndex  uint8  `json:"playerIndex"`
	Position     uint16 `json:"position"`
	Health       uint8  `json:"health"`
	Buffs        uint8  `json:"buffs"`
	BombAmount   uint8  `json:"bombAmount"`
	BombStrength uint8  `json:"bombStrength"`
	Speed        uint8  `json:"Speed"`
}

func (g *Gamestate) createPlayArea(height, width int) {
	if g.PlayArea != nil {
		return
	}
	var playareaRows [][]int

	for row := 0; row < height; row++ {
		arr := make([]int, width)
		addObstacles(arr)
		if row%2 == 1 && row != height-1 {
			addBlockers(arr)
		}
		playareaRows = append(playareaRows, arr)
	}
	clearStarts(playareaRows)
	g.PlayArea = flatten(playareaRows)
}

func (p *PlayerState) addBuff(buff uint8) {
	p.Buffs |= buff
}

func (p *PlayerState) removeBuff(buff uint8) {
	p.Buffs &^= buff
}

func (p *PlayerState) hasBuff(buff uint8) bool {
	return p.Buffs&buff != 0
}

func (p *PlayerState) addBomb() error {
	if p.BombAmount < maxBombs {
		p.BombAmount++
		return nil
	} else {
		return fmt.Errorf("max bombs aquired")
	}
}

func (p *PlayerState) addFlames() error {
	if p.BombStrength < maxFlames {
		p.BombStrength++
		return nil
	} else {
		return fmt.Errorf("max flames aquired")
	}
}

func (g *Gamestate) GetPlayerCount() int {
	return len(g.Players)
}

func (g *Gamestate) AddNewPlayer(username string) {
	if g.Players == nil {
		g.Players = make(map[string]PlayerState)
	}

	newPlayer := PlayerState{
		PlayerIndex:  uint8(g.GetPlayerCount()),
		Position:     uint16(0),
		Health:       uint8(3),
		Buffs:        uint8(0),
		BombAmount:   uint8(0),
		BombStrength: uint8(1),
		Speed:        uint8(0),
	}
	g.Players[username] = newPlayer
}

func (g *Gamestate) RemovePlayer(username string) {
	gamestateMutex.Lock()
	defer gamestateMutex.Unlock() // Ensure mutex is unlocked even if a panic occurs
	delete(g.Players, username)
}

func (g *Gamestate) UpdateGamestate(player string, data interface{}) {
	playerState, ok := g.Players[player]
	if !ok {
		// Handle case where player doesn't exist in the map
		// You might want to log an error or handle it accordingly
		log.Println("player not found: ", player)
	}

	updateState(data, &playerState)

	gamestateMutex.Lock()
	defer gamestateMutex.Unlock() // Ensure mutex is unlocked even if a panic occurs

	// Update the player's state in the map
	g.Players[player] = playerState
}

// sets players to their starting positions
func (g *Gamestate) setPlayers() {
	starts := []uint16{0, 399, 19, 380}
	var i uint8 = 0
	gamestateMutex.Lock()
	defer gamestateMutex.Unlock()
	for player := range g.Players {
		pState := g.Players[player]
		pState.Position = starts[i]
		pState.PlayerIndex = i
		g.Players[player] = pState
		i++
	}
}

func (g *Gamestate) appendBombs(data interface{}) {
	bombData, ok := data.([]interface{})
	if !ok {
		// Handle the case where data is not a slice of interfaces
		log.Println("Error: data is not a slice of interfaces")
		return
	}

	var bombs []int
	for _, item := range bombData {
		switch v := item.(type) {
		case int:
			bombs = append(bombs, v)
		case float64:
			bombs = append(bombs, int(v)) // Convert float64 to int
		default:
			// Handle the case where an element in the slice is not an int or float64
			log.Println("Error: element in the slice is not an int or float64")
			return
		}
	}

	gamestateMutex.Lock()
	defer gamestateMutex.Unlock()
	g.Bombs = append(g.Bombs, bombs)
}

func (g *Gamestate) Reset() {
	g.Players = nil
	g.PlayArea = nil
	g.Bombs = nil
}

// Assert data to map[string]interface{}
func updateState(data interface{}, state *PlayerState) {
	assertedData, ok := data.(map[string]interface{})
	if !ok {
		log.Println("Data is not a map[string]interface{}")
		return
	}
	for key, value := range assertedData {
		switch key {
		case "position":
			if pos, ok := value.(float64); ok {
				state.Position = uint16(pos)
			} else {
				log.Printf("Error converting position to uint16\n")
			}
		case "health":
			if health, ok := value.(float64); ok {
				state.Health = uint8(health)
			} else {
				log.Printf("Error converting health to uint8\n")
			}
		case "buffs":
			if buffs, ok := value.(float64); ok {
				state.Buffs = uint8(buffs)
			} else {
				log.Printf("Error converting buffs to uint8\n")
			}
		case "bombStrength":
			if strength, ok := value.(float64); ok {
				state.BombStrength = uint8(strength)
			} else {
				log.Printf("Error converting bombStrength to uint8\n")
			}
		case "Speed":
			if speed, ok := value.(float64); ok {
				state.Speed = uint8(speed)
			} else {
				log.Printf("Error converting Speed to uint8\n")
			}
		case "bombAmount":
			if amount, ok := value.(float64); ok {
				state.BombAmount = uint8(amount)
			} else {
				log.Printf("Error converting bombAmount to uint8\n")
			}
		case "playerIndex":
			continue
		default:
			log.Printf("Unknown key: %s\n", key)
		}
	}
}

func flatten(playareaRows [][]int) []int {
	var flattened []int
	for _, row := range playareaRows {
		flattened = append(flattened, row...)
	}
	return flattened
}

func clearStarts(playarea [][]int) {
	iLast := len(playarea[0]) - 1
	for iRow := range playarea {
		if iRow == 0 || iRow == len(playarea)-1 {
			playarea[iRow][0] = 0
			playarea[iRow][1] = 0
			playarea[iRow][iLast-1] = 0
			playarea[iRow][iLast] = 0
		}
		if iRow == 1 || iRow == len(playarea)-2 {
			playarea[iRow][0] = 0
			playarea[iRow][iLast] = 0
		}
	}
}

func addBlockers(row []int) {
	for i := 1; i < len(row); i += 2 {
		row[i] = 2
	}
}

func addObstacles(row []int) {
	for i := range row {
		// skips adding some obstacles
		if rand.Float32() > 0.9 {
			continue
		}
		row[i] = 1
	}
}

type Powerup struct {
	Name     string
	Position int // Cell position where the powerup is located
}

// RandomPowerup generates a random powerup and sends it to all clients
func (s *Server) RandomPowerup(data interface{}) {
	// Type assert the data to get the list of adjacent cells
	adjacentCells, ok := data.([]interface{})
	if !ok {
		fmt.Println("Error: data is not a list of adjacent cells")
		return
	}

	// Iterate over each element in the slice and type assert it as a map
	var cells []map[string]interface{}
	for _, item := range adjacentCells {
		cell, ok := item.(map[string]interface{})
		if !ok {
			fmt.Println("Error: invalid adjacent cell format")
			return
		}
		cells = append(cells, cell)
	}

	// Filter cells that have obstacles
	obstacleCells := make([]map[string]interface{}, 0)
	for _, cell := range cells {
		row := cell["row"].(float64)
		col := cell["col"].(float64)
		point := (col) + (row)*20
		// Check if the cell has an obstacle
		if point >= 0 && point <= 399 {
			if s.gamestate.PlayArea[int(point)] == 1 {
				obstacleCells = append(obstacleCells, cell)
			}
		}
	}

	// If there are no cells with obstacles, return
	if len(obstacleCells) == 0 {
		fmt.Println("no obstacles")
		return
	}

	// Choose a random adjacent cell from the list of cells with obstacles
	randomCell := obstacleCells[rand.Intn(len(obstacleCells))]

	// Extract the row and col values
	row, rowOk := randomCell["row"].(float64)
	col, colOk := randomCell["col"].(float64)
	if !rowOk || !colOk {
		fmt.Println("Error: invalid row or col value in adjacent cell")
		return
	}

	// Define a list of possible powerups
	powerups := []string{"fire", "bomb", "speed"}

	// Generate a random powerup
	randomPowerup := powerups[rand.Intn(len(powerups))]

	// Calculate the position of the powerup
	position := int(row)*20 + int(col)

	// Send information about the generated powerup to all clients
	updateMessage := WebSocketUpdate{
		Type: "powerup",
		Data: &Powerup{Name: randomPowerup, Position: position},
	}
	s.broadcast(updateMessage)
}
