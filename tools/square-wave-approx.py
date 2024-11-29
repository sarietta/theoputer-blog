import PySimpleGUI as sg
import numpy as np

"""
    Embedding the Matplotlib toolbar into your application

    Copyright 2023 PySimpleSoft, Inc. and/or its licensors. All rights reserved.

    Redistribution, modification, or any other use of PySimpleGUI or any portion thereof is subject to the terms of the PySimpleGUI License Agreement available at https://eula.pysimplegui.com.

    You may not redistribute, modify or otherwise use PySimpleGUI or its contents except pursuant to the PySimpleGUI License Agreement.
"""

# ------------------------------- This is to include a matplotlib figure in a Tkinter canvas
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg, NavigationToolbar2Tk


def square_wave(x, period):
    """Generates a square wave with given period."""
    return np.sign(np.sin(2 * np.pi * x / period))


def fourier_series_square_wave(x, period, n_terms):
    """Approximates a square wave using Fourier series."""
    result = 0
    for k in range(1, n_terms + 1, 2):
        result += (4 / (np.pi * k)) * np.sin(2 * np.pi * k * x / period)
    return result


def draw(canvas, figure):
    # Define parameters
    period = 2 * np.pi
    n_terms = 10
    x = np.linspace(0, 2 * period, 1000)

    # Generate square wave and Fourier approximation
    y_square = square_wave(x, period)
    y_fourier = fourier_series_square_wave(x, period, n_terms)

    # Plot the results
    plt.plot(x, y_square, label="Square wave")
    plt.plot(x, y_fourier, label="Fourier approximation")
    plt.title("Fourier Series Approximation of a Square Wave")
    plt.xlabel("x")
    plt.ylabel("y")
    plt.legend()
    plt.show()

    figure_canvas_agg = FigureCanvasTkAgg(fig, master=canvas)
    figure_canvas_agg.draw()


def draw_figure_w_toolbar(canvas, fig, canvas_toolbar):
    if canvas.children:
        for child in canvas.winfo_children():
            child.destroy()
    if canvas_toolbar.children:
        for child in canvas_toolbar.winfo_children():
            child.destroy()
    figure_canvas_agg = FigureCanvasTkAgg(fig, master=canvas)
    figure_canvas_agg.draw()
    toolbar = Toolbar(figure_canvas_agg, canvas_toolbar)
    toolbar.update()
    figure_canvas_agg.get_tk_widget().pack(side='right', fill='both', expand=1)


class Toolbar(NavigationToolbar2Tk):
    def __init__(self, *args, **kwargs):
        super(Toolbar, self).__init__(*args, **kwargs)


# ------------------------------- PySimpleGUI CODE

layout = [
    [sg.T('Graph: y=sin(x)')],
    [sg.B('Plot'), sg.B('Exit')],
    [sg.T('Controls:')],
    [sg.Canvas(key='controls_cv')],
    [sg.T('Figure:')],
    [sg.Column(
        layout=[
            [sg.Canvas(key='fig_cv',
                       # it's important that you set this size
                       size=(400 * 2, 400)
                       )]
        ],
        background_color='#DAE0E6',
        pad=(0, 0)
    )],
    [sg.B('Alive?')]

]

window = sg.Window('Graph with controls', layout)

while True:
    event, values = window.read()
    print(event, values)
    if event in (sg.WIN_CLOSED, 'Exit'):  # always,  always give a way out!
        break
    elif event is 'Plot':
        # ------------------------------- PASTE YOUR MATPLOTLIB CODE HERE
        plt.figure(1)
        fig = plt.gcf()
        DPI = fig.get_dpi()
        # ------------------------------- you have to play with this size to reduce the movement error when the mouse hovers over the figure, it's close to canvas size
        fig.set_size_inches(404 * 2 / float(DPI), 404 / float(DPI))
        # -------------------------------
        x = np.linspace(0, 2 * np.pi)
        y = np.sin(x)
        plt.plot(x, y)
        plt.title('y=sin(x)')
        plt.xlabel('X')
        plt.ylabel('Y')
        plt.grid()

        # ------------------------------- Instead of plt.show()
        draw_figure_w_toolbar(window['fig_cv'].TKCanvas, fig, window['controls_cv'].TKCanvas)

window.close()
