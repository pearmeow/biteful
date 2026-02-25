# biteful

An app that promotes healthy eating.

## Instructions

These instructions were tested on Linux (Ubuntu/Debian) machines.

1. Install Frontend Dependencies (Node.js)

    Vite and React require **Node.js** and **npm**.

    ```bash
    sudo apt install nodejs npm
    ```

2. Install Packages in Frontend

    You need to install the packages used in the frontend before
    running the dev server.

    ```bash
    cd frontend
    npm install
    ```

3. Install Backend Dependencies (C++, Drogon)

    A C++17 (or higher) compiler and `cmake` is required.

    ```bash
    sudo apt install git gcc g++ cmake
    ```

    Drogon relies on the `jsoncpp`, `uuid`, `zlib`, and 'yaml'.

    ```bash
    sudo apt install libjsoncpp-dev uuid-dev zlib1g-dev libssl-dev libyaml-cpp-dev 
    ```

    Navigate outside of the Biteful folder.
    Install the drogon framework so that `drogon_ctl` can be used.

    ```bash
    git clone https://github.com/drogonframework/drogon
    cd drogon
    git submodule update --init
    mkdir build
    cd build
    cmake ..
    make && sudo make install
    ```

4. Launch the Project

    Navigate into the project's backend folder and compile using:

    ```bash
    mkdir build
    cd build
    cmake ..
    make
    ./backend
    ```

    Then navigate into the frontend folder and run the dev server with:

    ```bash
    cd ../../frontend
    npm run dev
    ```

    The frontend should be visible on port 5173 of localhost.
    The backend is accessible from port 5555 of localhost but
    will only return json responses.

## Authors

[Perry Huang](https://github.com/pearmeow)  
[Angel Mejia](https://github.com/AngelMM26)  
[Remi Uy](https://github.com/RemiUy05)  
[Jason Lin](https://github.com/niljason)
