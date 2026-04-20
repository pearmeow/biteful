#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting Biteful Setup"

# 1. System Dependencies
echo "Installing system dependencies"
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib libpq-dev \
                    git gcc g++ cmake libjsoncpp-dev uuid-dev \
                    zlib1g-dev libssl-dev libyaml-cpp-dev libsodium-dev pkg-config

# 2. Database Setup
echo "Configuring PostgreSQL"
sudo service postgresql start
# Note: This uses the credentials from your instructions. 
# It checks if the user exists before creating to avoid errors on re-run.
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='user'" | grep -q 1 || \
sudo -u postgres psql -c "CREATE USER \"user\" WITH PASSWORD 'password'; ALTER ROLE \"user\" CREATEDB;"

# 3. Drogon Framework Installation (Only if drogon_ctl is missing)
if ! command -v drogon_ctl &> /dev/null; then
    echo "Drogon not found. Installing framework"
    pushd ~
    git clone https://github.com/drogonframework/drogon
    cd drogon && git submodule update --init
    mkdir -p build && cd build
    cmake ..
    make -j$(nproc) && sudo make install
    popd
else
    echo "Drogon framework already installed."
fi

# 4. Frontend Setup
echo "Setting up Frontend"
cd frontend
npm install
if [ ! -f .env ]; then
    echo 'VITE_API_BASE_URL="http://localhost:5555/"' > .env
    echo "Created frontend .env"
fi
cd ..

# 5. Backend Setup
echo "Setting up Backend"
cd backend
if [ ! -f .env ]; then
    cat <<EOT > .env
DB_NAME=biteful
DB_USER=user
DB_PASSWORD=password
EOT
    echo "Created backend .env"
fi


# 6. Database Initialization
echo "Initializing database and pantry data."
unzip datasets.zip
./init_database.sh
./init_pantries.sh
./init_restaurants.sh
cd ..

# 7. Backend Compilation
mkdir -p build && cd build
cmake ..
make -j$(nproc)
cd ..

echo "Setup complete! To run the app:"
echo "   Backend: cd backend/build && ./backend"
echo "   Frontend: cd frontend && npm run dev"