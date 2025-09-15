package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Gate represents a logic gate or input/output in the circuit
type Gate struct {
	ID    string `json:"id"`
	Type  string `json:"type"`
	Label string `json:"label,omitempty"`
	In1   string `json:"in1,omitempty"`
	In2   string `json:"in2,omitempty"`
	X     int    `json:"x"`
	Y     int    `json:"y"`
}

// Circuit represents the entire circuit definition
type Circuit struct {
	Gates []Gate `json:"gates"`
}

const (
	gateWidth  = 80
	gateHeight = 40
	pinRadius  = 3
	fontSize   = 16
)

func generateSVG(circuit Circuit) (string, error) {
	var svgElements []string
	maxX := 0
	maxY := 0

	// Calculate overall SVG dimensions
	for _, gate := range circuit.Gates {
		if gate.X+gateWidth > maxX {
			maxX = gate.X + gateWidth
		}
		if gate.Y+gateHeight > maxY {
			maxY = gate.Y + gateHeight
		}
	}

	width := maxX + 100 // Add some margin
	height := maxY + 100 // Add some margin

	// Store gate output coordinates
	gateOutputCoords := make(map[string][2]int) // Stores [x, y] for the output pin of each gate

	// First pass: Draw gates and determine output coordinates
	for _, gate := range circuit.Gates {
		x := gate.X
		y := gate.Y

		switch gate.Type {
		case "INPUT":
			svgElements = append(svgElements, fmt.Sprintf(`<text x="%d" y="%d" font-family="monospace" font-size="%d">%s</text>`, x-20, y+gateHeight/2+fontSize/2-5, fontSize, gate.Label))
			outputPinX := x + gateWidth
			outputPinY := y + gateHeight/2
			svgElements = append(svgElements, fmt.Sprintf(`<circle cx="%d" cy="%d" r="%d" fill="black"/>`, outputPinX, outputPinY, pinRadius))
			gateOutputCoords[gate.ID+".out"] = [2]int{outputPinX, outputPinY}
		case "OUTPUT":
			inputPinX := x
			inputPinY := y + gateHeight/2
			svgElements = append(svgElements, fmt.Sprintf(`<circle cx="%d" cy="%d" r="%d" fill="black"/>`, inputPinX, inputPinY, pinRadius))
			svgElements = append(svgElements, fmt.Sprintf(`<text x="%d" y="%d" font-family="monospace" font-size="%d">%s</text>`, x+gateWidth+10, y+gateHeight/2+fontSize/2-5, fontSize, gate.Label))
		default: // Standard logic gates (XOR, AND, OR)
			svgElements = append(svgElements, fmt.Sprintf(`<rect x="%d" y="%d" width="%d" height="%d" fill="lightblue" stroke="black"/>`, x, y, gateWidth, gateHeight))
			svgElements = append(svgElements, fmt.Sprintf(`<text x="%d" y="%d" text-anchor="middle" font-family="monospace" font-size="%d">%s</text>`, x+gateWidth/2, y+gateHeight/2+fontSize/2-5, fontSize, gate.Type))

			// Input pins
			svgElements = append(svgElements, fmt.Sprintf(`<circle cx="%d" cy="%d" r="%d" fill="black"/>`, x, y+gateHeight/4, pinRadius))   // Input 1
			svgElements = append(svgElements, fmt.Sprintf(`<circle cx="%d" cy="%d" r="%d" fill="black"/>`, x, y+3*gateHeight/4, pinRadius)) // Input 2

			// Output pin
			outputPinX := x + gateWidth
			outputPinY := y + gateHeight/2
			svgElements = append(svgElements, fmt.Sprintf(`<circle cx="%d" cy="%d" r="%d" fill="black"/>`, outputPinX, outputPinY, pinRadius))
			gateOutputCoords[gate.ID+".out"] = [2]int{outputPinX, outputPinY}
		}
	}

	// Second pass: Draw connections
	for _, gate := range circuit.Gates {
		x := gate.X
		y := gate.Y

		// Connect input 1
		if gate.In1 != "" && gate.Type != "INPUT" {
			sourceRef := gate.In1
			if coords, ok := gateOutputCoords[sourceRef]; ok {
				sx, sy := coords[0], coords[1]
				dx, dy := x, y+gateHeight/4 // Input 1 pin
				svgElements = append(svgElements, fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="black" stroke-width="2"/>`, sx, sy, dx, dy))
			}
		}

		// Connect input 2
		if gate.In2 != "" && gate.Type != "INPUT" {
			sourceRef := gate.In2
			if coords, ok := gateOutputCoords[sourceRef]; ok {
				sx, sy := coords[0], coords[1]
				dx, dy := x, y+3*gateHeight/4 // Input 2 pin
				svgElements = append(svgElements, fmt.Sprintf(`<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="black" stroke-width="2"/>`, sx, sy, dx, dy))
			}
		}
	}

	svgContent := fmt.Sprintf(`<svg width="%d" height="%d" viewBox="0 0 %d %d" xmlns="http://www.w3.org/2000/svg">
    %s
</svg>`, width, height, width, height, strings.Join(svgElements, "\n    "))

	return svgContent, nil
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run main.go <json_file_path>")
		os.Exit(1)
	}

	jsonFilePath := os.Args[1]
	data, err := os.ReadFile(jsonFilePath)
	if err != nil {
		fmt.Printf("Error reading file: %v\n", err)
		os.Exit(1)
	}

	var circuit Circuit
	err = json.Unmarshal(data, &circuit)
	if err != nil {
		fmt.Printf("Error unmarshaling JSON: %v\n", err)
		os.Exit(1)
	}

	svgOutput, err := generateSVG(circuit)
	if err != nil {
		fmt.Printf("Error generating SVG: %v\n", err)
		os.Exit(1)
	}

	fmt.Println(svgOutput)
}
