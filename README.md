How to Run   
1. Run the container   
`docker run -v ./ludo:/code -p 5173:5173 --rm -it suloch/bun:latest bash`
2. Start application using the bun runtime   
`bun run dev --host`  
3. Open `localhost:5173` in the browser
