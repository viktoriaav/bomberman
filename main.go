package main

import (
	"log"
	"net/http"

	"main/server"
)

func main() {
	wsServer := server.NewServer()

	fs := http.FileServer(http.Dir("client"))

	http.Handle("/", http.StripPrefix("/", fs))
	// http.Handle("/js/components/", http.StripPrefix("/js/components/", fs))
	http.HandleFunc("/ws", wsServer.HandleWebSocket)
	log.Printf("Starting server at: http://localhost:1111\nPress CTRL + c to shut it down.\n")
	err := http.ListenAndServe(":1111", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
