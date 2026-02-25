#include <drogon/drogon.h>
#include <json/value.h>

#include <cstdlib>
#include <fstream>

int main() {
    // Set HTTP listener address and port
    drogon::app().addListener("0.0.0.0", 5555);
    // Load config file

    // get the config but change db name, user, and passwd so we don't
    // store it in the json file
    Json::Value config;
    std::ifstream jsonFileStream("../config.json", std::ifstream::binary);
    jsonFileStream >> config;
    config["db_clients"][0]["dbname"] = std::getenv("DB_NAME");
    config["db_clients"][0]["user"] = std::getenv("DB_USER");
    config["db_clients"][0]["passwd"] = std::getenv("DB_PASSWORD");
    drogon::app().loadConfigJson(config);

    // Run HTTP framework,the method will block in the internal event loop
    drogon::app().run();
    return 0;
}
