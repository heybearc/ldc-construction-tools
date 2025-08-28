#!/bin/bash

# LDC Construction Tools - Server Restart Script
# Kills processes on required ports and restarts both frontend and backend

echo "🔄 Restarting LDC Construction Tools servers..."

# Kill processes on required ports
echo "🛑 Killing processes on ports 3000, 8000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Wait a moment for processes to fully terminate
sleep 2

# Start backend server
echo "🚀 Starting backend server on port 8000..."
cd backend
source venv/bin/activate
python3 start_server.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend server
echo "🚀 Starting frontend server on port 3000..."
cd frontend
npm run dev -- --port 3000 &
FRONTEND_PID=$!
cd ..

echo "✅ Servers started:"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:3000"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"

# Save PIDs for later cleanup
echo $BACKEND_PID > .backend_pid
echo $FRONTEND_PID > .frontend_pid

echo "🔍 Testing server connectivity..."
sleep 5

# Test backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is not responding"
fi

# Test frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

echo "🎉 Server restart complete!"
