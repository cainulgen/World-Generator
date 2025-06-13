# World Generator

> **NOTE FOR AI CODE AGENTS & CONTRIBUTORS**
>
> This project is a **browser game**.  
> All code will be pushed to GitHub, served live via GitHub Pages, and must work when run directly in a browser (no server-side stuff, no Node-only modules).  
> Test your work in this environment—if it breaks on GitHub Pages, it's not good enough.
>
> Build everything with this deployment and use case in mind.

A browser-based land generation tool that creates beautiful and customizable landscapes.

## Development Guidelines

### Code Organization Principles

1. **Modular Design**
   - Break down functionality into logical, self-contained modules
   - Each module should have a clear, single responsibility
   - Keep related features together while maintaining separation of concerns

2. **File Structure**
   - Organize code into meaningful directories based on functionality
   - Separate core generation logic from UI components
   - Keep utility functions and shared resources in dedicated locations

3. **Balance in Code Organization**
   - Avoid monolithic single-file solutions
   - Don't over-segment code into too many small files
   - Find the right balance between modularity and maintainability

4. **Future-Proofing**
   - Design with extensibility in mind
   - Make it easy to add new features without major refactoring
   - Keep interfaces between modules clean and well-defined

### Getting Started

The project currently consists of three main files:

- `index.html`: The main entry point that loads Three.js and our application code
- `styles.css`: Basic styling for the scene container and dark background
- `main.js`: Core Three.js implementation featuring:
  - A 2000m x 2000m landscape plane
  - Orbit controls for camera movement (rotate, zoom, pan)
  - Responsive design that adapts to window resizing
  - Basic lighting setup

To run the project locally, simply open `index.html` in a web browser. For live deployment, enable GitHub Pages in your repository settings.

## Features

*Features will be listed here as they are implemented.*
