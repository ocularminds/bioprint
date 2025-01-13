# FPValidator_Node

## Fingerprint Server
This project is a Fingerprint API Service built using Node.js, Express, and EventEmitter for handling biometric fingerprint verification.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [GET /](#get-)
  - [POST /api/fingers](#post-apifingers)
  - [POST /api/fingers/:id/verify](#post-apifingersidverify)
  - [GET /api/requests/:kioskStationID](#get-apirequestskioskstationid)
  - [GET /api/events](#get-apievents)
- [Event Handling](#event-handling)
- [Error Handling](#error-handling)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fingerprint-api-service.git
   cd fingerprint-api-service

2. Set the Visual Studio version
```npm config set msvs_version 2022 --global```bash

3. Change to the FingerprintServer directory. Run the following to install dependencies:
```npm install```bash
