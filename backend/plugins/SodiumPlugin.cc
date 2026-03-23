#include "./SodiumPlugin.h"

#include <drogon/drogon.h>

void SodiumPlugin::initAndStart(const Json::Value& config) {
    if (sodium_init() < 0) {
        LOG_FATAL << "Sodium initialization failed!";
    }
    LOG_INFO << "SodiumPlugin initialized successfully.";
}

void SodiumPlugin::shutdown() {
    LOG_INFO << "SodiumPlugin shutting down.";
}

std::string SodiumPlugin::hashPassword(const std::string& password) const {
    char out[crypto_pwhash_STRBYTES];
    if (crypto_pwhash_str(out, password.c_str(), password.length(), opsLimit_, memLimit_) != 0) {
        throw std::runtime_error("Internal error: Libsodium hashing failed.");
    }
    return std::string(out);
}

bool SodiumPlugin::verifyPassword(const std::string& password, const std::string& hash) const {
    return crypto_pwhash_str_verify(hash.c_str(), password.c_str(), password.length()) == 0;
}
