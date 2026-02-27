# biteful

An app that promotes healthy eating.

## Instructions

These instructions were tested on Linux (Ubuntu/Debian) machines.

1. Clone the Repo

    ```bash
    git clone git@github.com:niljason/biteful.git
    ```

2. Install Frontend Dependencies (Node.js)

    Vite and React require **Node.js** and **npm**.

    ```bash
    sudo apt install nodejs npm
    ```

3. Install Packages in Frontend

    You need to install the packages used in the frontend before
    running the dev server.

    ```bash
    cd frontend
    npm install
    ```

4. Install Postgres

    A Postgres database is used in the backend.

    ```bash
    sudo apt install postgresql postgresql-contrib libpq-dev
    ```

    Make sure to setup a postgres user and add the credentials to an `.env` file.

    ```bash
    sudo -u postgres psql
    ```

    In your `psql` terminal run the following commands.

    ```sql
    # Replace user and password with your choice
    CREATE USER user WITH PASSWORD 'password'; 

    # Grant the user the ability to create databases
    ALTER ROLE user CREATEDB;
    ```

    Your `.env` file should be located in `~/biteful/backend` and look something
    like the following. Make sure the user and password match what you set above.

    ```bash
    DB_NAME=biteful
    DB_USER=user
    DB_PASSWORD=password
    ```

5. Install Backend Dependencies (C++, Drogon)

    A C++17 (or higher) compiler and `cmake` is required.

    ```bash
    sudo apt install git gcc g++ cmake
    ```

    Drogon relies on `jsoncpp`, `uuid`, `zlib`, and `yaml`.

    ```bash
    sudo apt install libjsoncpp-dev uuid-dev \
    zlib1g-dev libssl-dev libyaml-cpp-dev 
    ```

    Install the drogon framework so that `drogon_ctl` can be used.

    ```bash
    cd ~
    git clone https://github.com/drogonframework/drogon
    cd drogon
    git submodule update --init
    mkdir build
    cd build
    cmake ..
    make && sudo make install
    ```

6. Launch the Project

    Navigate into the project's backend folder and compile using:

    ```bash
    cd ~/biteful/backend
    rm -rf build
    mkdir build
    cd build
    cmake ..
    make
    ./backend
    ```

    Then navigate into the backend folder and setup the database with:

    ```bash
    cd ~/biteful/backend
     ./init_database.sh
     ```

    Then navigate into the frontend folder and run the dev server with:

    ```bash
    cd ~/biteful/frontend
    npm run dev
    ```

    The frontend should be visible on port 5173 of localhost.
    The backend is accessible from port 5555 of localhost but
    will only return json responses.

## Other Operating Systems

For other operating systems, installing the tools may be slightly different.
Please refer to their documentation.

## Authors

[Perry Huang](https://github.com/pearmeow)  
[Angel Mejia](https://github.com/AngelMM26)  
[Remi Uy](https://github.com/RemiUy05)  
[Jason Lin](https://github.com/niljason)
