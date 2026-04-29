#include <drogon/HttpAppFramework.h>
#include <drogon/drogon.h>
#include <json/value.h>

#include <cstdlib>
#include <fstream>
#include <string>

// #include "./filters/CorsFilter.h"

/**
 * Simple helper to load KEY=VALUE pairs from a .env file
 * into the process environment.
 */
void loadEnv(const std::string& path) {
    std::ifstream envFile(path);
    if (!envFile.is_open()) {
        LOG_WARN << "No .env file found at " << path << ". Relying on system environment.";
        return;
    }

    std::string line;
    while (std::getline(envFile, line)) {
        // Remove carriage return for Windows compatibility
        if (!line.empty() && line.back() == '\r') line.pop_back();

        // Skip empty lines or comments
        if (line.empty() || line[0] == '#') continue;

        size_t delimiterPos = line.find('=');
        if (delimiterPos != std::string::npos) {
            std::string key = line.substr(0, delimiterPos);
            std::string value = line.substr(delimiterPos + 1);

            // Remove optional quotes from value
            if (value.size() >= 2 && value.front() == '"' && value.back() == '"') {
                value = value.substr(1, value.size() - 2);
            }

            // 1 means overwrite existing environment variables
            setenv(key.c_str(), value.c_str(), 1);
        }
    }
    LOG_INFO << "Environment variables loaded from .env";
}

int main() {
    loadEnv("../.env");

    long port = 5555;
    std::string strPort = std::getenv("PORT");
    if (!strPort.empty()) {
        char* errPtr;
        long newPort = std::strtol(strPort.c_str(), &errPtr, 10);
        if (newPort < 0 || *errPtr != '\0') {
            // invalid port
        } else {
            port = newPort;
        }
    }

    bool localhost = getenv("LOCALHOST") != NULL;
    std::string origin = "http://localhost:5173";
    if (!localhost) {
        origin = "https://pearmeow-biteful.netlify.app";
    }

    drogon::app().addListener("0.0.0.0", port);
    // GLOBAL PRE-ROUTING: Handle OPTIONS before any controller or other filter
    drogon::app().registerPreRoutingAdvice([origin](const drogon::HttpRequestPtr& req,
                                                    drogon::AdviceCallback&& acb,
                                                    drogon::AdviceChainCallback&& accb) {
        if (req->method() == drogon::Options) {
            auto res = drogon::HttpResponse::newHttpResponse();
            // TODO: change this allow origin to a environment variable of where the frontend is
            res->addHeader("Access-Control-Allow-Origin", origin);
            res->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            // don't need authorization in here
            res->addHeader("Access-Control-Allow-Headers", "Content-Type");
            res->addHeader("Access-Control-Allow-Credentials", "true");
            res->setStatusCode(drogon::k200OK);
            acb(res);  // Short-circuit: send response now
        } else {
            accb();  // Continue to regular routing for GET/POST/etc
        }
    });

    // GLOBAL POST-HANDLING: Ensure the actual POST response also has the headers
    drogon::app().registerPostHandlingAdvice(
        [origin](const drogon::HttpRequestPtr&, const drogon::HttpResponsePtr& res) {
            // TODO: change this allow origin to a environment variable of where the frontend is
            res->addHeader("Access-Control-Allow-Origin", origin);
            res->addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            // don't need authorization in here
            res->addHeader("Access-Control-Allow-Headers", "Content-Type");
            res->addHeader("Access-Control-Allow-Credentials", "true");
        });

    Json::Value config;
    std::ifstream jsonFileStream("../config.json", std::ifstream::binary);

    if (!jsonFileStream.is_open()) {
        LOG_ERROR << "Could not open config.json!";
        return 1;
    }
    jsonFileStream >> config;

    // Helper lambda to safely get env vars after loadEnv has run
    auto getSafeEnv = [](const char* key) -> std::string {
        char* val = std::getenv(key);
        return (val == nullptr) ? "" : std::string(val);
    };

    std::string dbName = getSafeEnv("DB_NAME");
    std::string dbUser = getSafeEnv("DB_USER");
    std::string dbPass = getSafeEnv("DB_PASSWORD");

    // Log what we found (be careful not to log passwords in production!)
    LOG_INFO << "Configuring DB: " << dbName << " as User: " << dbUser;

    if (dbName.empty() || dbUser.empty()) {
        LOG_ERROR << "CRITICAL: Database environment variables are missing!";
    }

    if (config.isMember("db_clients") && config["db_clients"].size() > 0) {
        config["db_clients"][0]["dbname"] = dbName;
        config["db_clients"][0]["user"] = dbUser;
        config["db_clients"][0]["passwd"] = dbPass;
    } else {
        LOG_ERROR << "config.json is missing 'db_clients' array!";
    }

    drogon::app().loadConfigJson(config).setClientMaxBodySize(5 * 1048576).setClientMaxMemoryBodySize(5 * 1048576);
    drogon::app().run();

    return 0;
}
