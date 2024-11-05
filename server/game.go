package server

import (
	"fmt"
	"time"
)

// Method to start the game loop
func (s *Server) startGameLoop() {
	s.gamestate.IsActive = true
	s.stopGameLoop = make(chan struct{})
	s.gamestate.setPlayers()

	fmt.Println(s.gamestate.Players)

	updateMessage := WebSocketUpdate{
		Type: "start",
		Data: s.gamestate.Players,
	}
	s.broadcast(updateMessage)

	// wait for the clients to render stuff
	time.Sleep(time.Second)
	// Start the goroutine to send game state data to players
	go s.sendGamestateToPlayers()
}

// Method to send game state data to players
func (s *Server) sendGamestateToPlayers() {
	ticker := time.NewTicker(time.Second / 60) // Ticker with 60Hz frequency

	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			// Convert game state to JSON
			updateMessage := WebSocketUpdate{
				Type: "gamestate",
				Data: s.gamestate,
			}

			if len(s.gamestate.Bombs) > 0 {
				s.gamestate.Bombs = [][]int{}
			}
			// Broadcast game state to all players
			s.broadcast(updateMessage)
		case <-s.stopGameLoop:
			fmt.Println("recieved stop signal")
			return
		}
	}
}

// Define a struct to hold the countdown control data
type CountdownControl struct {
	stop chan struct{} // Channel to signal countdown stop
}

// Function to start the countdown
func (s *Server) startCountDown(countdownDuration time.Duration, control *CountdownControl) {
	// Stop the existing timer if it's running
	if control.stop != nil {
		close(control.stop)
	}

	// Create a new stop channel for countdown
	control.stop = make(chan struct{})

	// Start the countdown
	go func() {
		for i := countdownDuration; i > 0; i-- {
			select {
			case <-control.stop:
				fmt.Println("Countdown stopped.")
				return // Exit goroutine if stop signal received
			default:
				updateMessage := WebSocketUpdate{
					Type: "countdown",
					Data: fmt.Sprintf("%d", i), // Convert remaining time to string
				}
				s.broadcast(updateMessage)
				time.Sleep(time.Second) // Wait for 1 second
			}
		}
		fmt.Println("Countdown ended.")
		s.startGameLoop()
	}()

	// Store the current countdown control
	s.countdownControl = control
}

// Function to stop the countdown
func (s *Server) stopCountDown() {
	if s.countdownControl != nil && s.countdownControl.stop != nil {
		close(s.countdownControl.stop)
		s.countdownControl = nil
		fmt.Println("Countdown stopped.")
	}
}

func checkForStart(players map[string]PlayerState, s *Server) {
	if len(players) > 1 && len(players) < 4 {
		// Stop any existing countdown before starting a new one
		s.stopCountDown()
		// Create a new CountdownControl
		control := &CountdownControl{stop: make(chan struct{})}
		// Start a new countdown for 20 seconds
		s.startCountDown(30, control)
	} else if len(players) == 4 {
		// Stop any existing countdown before starting a new one
		s.stopCountDown()
		// Create a new CountdownControl
		control := &CountdownControl{stop: make(chan struct{})}
		// Start a new countdown for 10 seconds
		s.startCountDown(10, control)
	}
}

func getPlayerNames(mymap map[string]PlayerState) []string {
	keys := make([]string, len(mymap))

	i := 0
	for k := range mymap {
		keys[i] = k
		i++
	}

	return keys
}
