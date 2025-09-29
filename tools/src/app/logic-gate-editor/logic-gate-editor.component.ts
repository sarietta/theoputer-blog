import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel

interface LogicGate {
  id: number;
  type: 'AND' | 'OR' | 'NOT';
  x: number;
  y: number;
  inputs: { id: string, connectedTo: string | null, x: number, y: number }[];
  outputs: { id: string, connectedTo: string | null, x: number, y: number }[];
}

interface Wire {
  id: number;
  startGateId: number;
  startPortId: string;
  endGateId: number | null;
  endPortId: string | null;
  label: string;
  segments: { x: number, y: number }[]; // Array of points for the polyline
}

@Component({
  selector: 'app-logic-gate-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logic-gate-editor.component.html',
  styleUrl: './logic-gate-editor.component.scss'
})
export class LogicGateEditorComponent {
  gates: LogicGate[] = [];
  wires: Wire[] = [];
  nextGateId: number = 1;
  nextWireId: number = 1;
  selectedGateType: LogicGate['type'] | null = null;

  drawingWire: Wire | null = null;
  lastPoint: { x: number, y: number } | null = null; // Last committed point for multi-segment wire drawing

  editingWire: Wire | null = null;
  editingWireLabel: string = '';
  editingWirePosition = { x: 0, y: 0 };

  draggingGate: LogicGate | null = null;
  dragStartPoint: { x: number, y: number } | null = null;
  gateStartPoint: { x: number, y: number } | null = null;

  constructor() { }

  selectGateType(type: LogicGate['type']): void {
    this.selectedGateType = type;
    console.log('Selected gate type:', this.selectedGateType);
  }

  onCanvasClick(event: MouseEvent): void {
    if (this.selectedGateType && !this.drawingWire) { // Only place gate if not drawing wire
      const svgElement = event.currentTarget as SVGSVGElement;
      const svgPoint = svgElement.createSVGPoint();
      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;

      const ctm = svgElement.getScreenCTM();
      if (ctm) {
        const inverseCTM = ctm.inverse();
        const transformedPoint = svgPoint.matrixTransform(inverseCTM);
        this.addGateToCanvas(this.selectedGateType, transformedPoint.x, transformedPoint.y);
      }
    } else if (this.drawingWire && this.lastPoint) { // Commit a bend point if drawing a wire
      console.log('onCanvasClick: Committing bend point'); // Added console.log
      // Get the current mouse position (which is the end of the temporary segment)
      const svgElement = event.currentTarget as SVGSVGElement;
      const svgPoint = svgElement.createSVGPoint();
      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;

      const ctm = svgElement.getScreenCTM();
      if (ctm) {
        const inverseCTM = ctm.inverse();
        const currentMousePoint = svgPoint.matrixTransform(inverseCTM);

        // Calculate the snapped point based on the last committed point
        const lastX = this.lastPoint.x;
        const lastY = this.lastPoint.y;
        let snappedX = currentMousePoint.x;
        let snappedY = currentMousePoint.y;

        const dx = Math.abs(snappedX - lastX);
        const dy = Math.abs(snappedY - lastY);

        if (dx > dy) {
          snappedY = lastY; // Snap to horizontal
        } else {
          snappedX = lastX; // Snap to vertical
        }

        // Add this snapped point as a new bend point
        this.drawingWire.segments.push({ x: snappedX, y: snappedY });
        this.lastPoint = { x: snappedX, y: snappedY }; // Update last committed point
      }
    }
    this.editingWire = null; // Close label editor if clicking elsewhere
  }

  startDrag(gate: LogicGate, event: MouseEvent): void {
    event.stopPropagation(); // Prevent canvas click and other events
    event.preventDefault(); // Prevent default browser drag behavior

    this.selectedGateType = null; // Deselect any gate type
    this.editingWire = null; // Close any open wire label editor
    this.drawingWire = null; // Stop drawing any wire

    this.draggingGate = gate;
    this.gateStartPoint = { x: gate.x, y: gate.y };

    const svgElement = (event.currentTarget as SVGElement).closest('.drawing-canvas') as SVGSVGElement;
    if (svgElement) {
      const svgPoint = svgElement.createSVGPoint();
      svgPoint.x = event.clientX;
      svgPoint.y = event.clientY;

      const ctm = svgElement.getScreenCTM();
      if (ctm) {
        const inverseCTM = ctm.inverse();
        this.dragStartPoint = svgPoint.matrixTransform(inverseCTM);
      }
    }
  }

  addGateToCanvas(type: LogicGate['type'], x: number, y: number): void {
    const newGate: LogicGate = {
      id: this.nextGateId++,
      type: type,
      x: x,
      y: y,
      inputs: [],
      outputs: []
    };

    const gateWidth = 40;
    const gateHeight = 40;

    if (type === 'AND' || type === 'OR') {
      newGate.inputs.push(
        { id: 'in1', connectedTo: null, x: 0, y: gateHeight * 0.25 },
        { id: 'in2', connectedTo: null, x: 0, y: gateHeight * 0.75 }
      );
      newGate.outputs.push(
        { id: 'out1', connectedTo: null, x: gateWidth, y: gateHeight * 0.5 }
      );
    } else if (type === 'NOT') {
      const notGateWidth = 20;
      const notCircleRadius = 3;
      newGate.inputs.push(
        { id: 'in1', connectedTo: null, x: 0, y: gateHeight * 0.5 }
      );
      newGate.outputs.push(
        { id: 'out1', connectedTo: null, x: notGateWidth + notCircleRadius * 2, y: gateHeight * 0.5 }
      );
    }

    this.gates.push(newGate);
    console.log('Added gate:', newGate);
    this.selectedGateType = null;
  }

  startWire(gate: LogicGate, port: { id: string, connectedTo: string | null, x: number, y: number }, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedGateType = null;
    this.editingWire = null; // Close label editor if starting to draw a wire
    this.draggingGate = null; // Stop dragging if starting to draw a wire

    const startX = gate.x + port.x;
    const startY = gate.y + port.y;

    this.drawingWire = {
      id: this.nextWireId++,
      startGateId: gate.id,
      startPortId: port.id,
      endGateId: null,
      endPortId: null,
      label: '',
      segments: [{ x: startX, y: startY }] // Initialize with the starting point
    };
    this.lastPoint = { x: startX, y: startY }; // Set the last committed point
    console.log('Started drawing wire from:', this.drawingWire);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const svgElement = document.querySelector('.drawing-canvas') as SVGSVGElement;
    if (!svgElement) return;

    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;

    const ctm = svgElement.getScreenCTM();
    if (!ctm) return;

    const inverseCTM = ctm.inverse();
    const transformedPoint = svgPoint.matrixTransform(inverseCTM);

    if (this.drawingWire && this.lastPoint) {
      // Implement 90-degree snapping logic
      const lastX = this.lastPoint.x;
      const lastY = this.lastPoint.y;
      let currentX = transformedPoint.x;
      let currentY = transformedPoint.y;

      const dx = Math.abs(currentX - lastX);
      const dy = Math.abs(currentY - lastY);

      // Snap to 90 degrees (horizontal or vertical)
      if (dx > dy) {
        currentY = lastY; // Snap to horizontal
      } else {
        currentX = lastX; // Snap to vertical
      }

      // Ensure the last segment in drawingWire.segments is always the temporary one
      if (this.drawingWire.segments.length === 1) {
        // Only the start point exists, add the first temporary segment
        this.drawingWire.segments.push({ x: currentX, y: currentY });
      } else {
        // Update the existing temporary last segment
        this.drawingWire.segments[this.drawingWire.segments.length - 1] = { x: currentX, y: currentY };
      }
    } else if (this.draggingGate && this.dragStartPoint && this.gateStartPoint) {
      const dx = transformedPoint.x - this.dragStartPoint.x;
      const dy = transformedPoint.y - this.dragStartPoint.y;

      this.draggingGate.x = this.gateStartPoint.x + dx;
      this.draggingGate.y = this.gateStartPoint.y + dy;

      // Update connected wires
      this.wires.forEach(wire => {
        // If the dragging gate is the start of the wire
        if (wire.startGateId === this.draggingGate?.id) {
          const startPort = this.draggingGate.outputs.find(p => p.id === wire.startPortId);
          if (startPort) {
            // Update the first segment's start point
            if (wire.segments.length > 0) {
              wire.segments[0].x = this.draggingGate.x + startPort.x;
              wire.segments[0].y = this.draggingGate.y + startPort.y;
            }
          }
        }
        // If the dragging gate is the end of the wire
        if (wire.endGateId === this.draggingGate?.id) {
          const endPort = this.draggingGate.inputs.find(p => p.id === wire.endPortId);
          if (endPort) {
            // Update the last segment's end point
            if (wire.segments.length > 0) {
              wire.segments[wire.segments.length - 1].x = this.draggingGate.x + endPort.x;
              wire.segments[wire.segments.length - 1].y = this.draggingGate.y + endPort.y;
            }
          }
        }
      });
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.drawingWire) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('gate-port') && target.classList.contains('input-port')) {
        // Attempt to connect to an input port
        const endGateElement = target.closest('g[data-gate-id]') as SVGGElement;
        if (endGateElement) {
          const endGateId = parseInt(endGateElement.getAttribute('data-gate-id') || '0');
          const endPortId = target.getAttribute('data-port-id');

          if (endGateId && endPortId) {
            const endGate = this.gates.find(g => g.id === endGateId);
            const endPort = endGate?.inputs.find(p => p.id === endPortId);

            const isInputPort = endGate?.inputs.some(p => p.id === endPortId);
            if (endGate && endPort && isInputPort && !endPort.connectedTo) {
              // Finalize the wire
              this.drawingWire.endGateId = endGateId;
              this.drawingWire.endPortId = endPortId;

              // Remove the temporary last segment and add the final segment to the input port
              if (this.drawingWire.segments.length > 1) {
                this.drawingWire.segments.pop(); // Remove temporary segment
              }
              const finalX = endGate.x + endPort.x;
              const finalY = endGate.y + endPort.y;
              this.drawingWire.segments.push({ x: finalX, y: finalY });


              this.wires.push(this.drawingWire);
              console.log('Wire connected:', this.drawingWire);

              // Update connectedTo properties
              const startGate = this.gates.find(g => g.id === this.drawingWire?.startGateId);
              const startPort = startGate?.outputs.find(p => p.id === this.drawingWire?.startPortId);
              if (startPort) startPort.connectedTo = `wire-${this.drawingWire.id}`;
              endPort.connectedTo = `wire-${this.drawingWire.id}`;
            } else {
              console.log('Invalid connection: Port already connected or not an input port.');
            }
          }
        }
      }
      // Reset drawing wire and last point only if successfully connected
      this.drawingWire = null;
      this.lastPoint = null;
    } else if (this.drawingWire) {
      // If drawingWire is active but mouseup was not on an input port, do not cancel drawing.
      // onCanvasClick will handle committing bend points.
      // However, if the user clicks outside the canvas, we might want to cancel.
      // For now, we'll let onCanvasClick handle it.
    }
    // Reset dragging state
    this.draggingGate = null;
    this.dragStartPoint = null;
    this.gateStartPoint = null;
  }

  editWireLabel(wire: Wire, event: MouseEvent): void {
    event.stopPropagation(); // Prevent onCanvasClick
    this.editingWire = wire;
    this.editingWireLabel = wire.label;

    // Calculate position for the input field using the segments array
    const svgElement = (event.currentTarget as SVGElement).closest('.drawing-canvas') as SVGSVGElement;
    const containerElement = (event.currentTarget as SVGElement).closest('.logic-gate-editor-container') as HTMLElement;
    if (svgElement && containerElement && wire.segments.length > 0) {
      const svgRect = svgElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();

      // Use the first and last points of the segments for positioning the label
      const firstPoint = wire.segments[0];
      const lastPoint = wire.segments[wire.segments.length - 1];

      const x = (firstPoint.x + lastPoint.x) / 2;
      const y = (firstPoint.y + lastPoint.y) / 2;

      // Transform SVG coordinates to screen coordinates for positioning HTML input
      const ctm = svgElement.getScreenCTM();
      if (ctm) {
        const svgPoint = svgElement.createSVGPoint();
        svgPoint.x = x;
        svgPoint.y = y;
        const screenPoint = svgPoint.matrixTransform(ctm);

        this.editingWirePosition = {
          x: screenPoint.x - containerRect.left, // Relative to container
          y: screenPoint.y - containerRect.top
        };
      }
    }
  }

  saveWireLabel(): void {
    if (this.editingWire) {
      this.editingWire.label = this.editingWireLabel;
      this.editingWire = null;
    }
  }

  cancelEditWireLabel(): void {
    this.editingWire = null;
  }

  getPolylinePoints(segments: { x: number, y: number }[]): string {
    return segments.map(p => `${p.x},${p.y}`).join(' ');
  }
}

