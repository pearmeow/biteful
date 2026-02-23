# biteful

---

An app that promotes healthy eating.

## Instructions

---
These instructions were tested on Linux (Ubuntu/Debian) machines.

1. Install Frontend Dependencies (Node.js)

  Vite and React require **Node.js** and **npm** (Node Package Manager)

    ```bash
    sudo apt install nodejs npm
    ```

2. Install Backend Dependencies (C++, Drogon)

    A C++17 (or higher) compiler and `cmake` is required.

    ```bash
    sudo apt install git gcc g++ cmake
    ```

    Drogon relies on the `jsoncpp`, `uuid`, and `zlib`.

    ```bash
    sudo apt install libjsoncpp-dev uuid-dev zlib1g-dev libssl-dev
    ```

    Installing the drogon framework so that `drogon_ctl` can be used.

    ```bash
    git clone https://github.com/drogonframework/drogon
    cd drogon
    git submodule update --init
    mkdir build
    cd build
    cmake ..
    make && sudo make install
    ```

3. Launching the Project

    Navigate into the project's backend folder and compile using:

    ```bash
    mkdir build
    cd build
    cmake ..
    make
    ./backend
    ```

## Authors

---

[Perry Huang](https://github.com/pearmeow)  
[Angel Mejia](https://github.com/AngelMM26)  
[Remi Uy](https://github.com/RemiUy05)  
[Jason Lin](https://github.com/niljason)
