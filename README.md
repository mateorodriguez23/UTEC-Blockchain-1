# Laboratorio: Conexión NestJS a Ethereum Sepolia (Clean Architecture)

Este proyecto implementa los principios de **Clean Architecture** conectando una API REST en **NestJS** a la red de prueba (testnet) **Ethereum Sepolia** utilizando la librería **Ethers.js** para leer datos en tiempo real de un Smart Contract (USDC).

---

## 🛠️ Estructura del Proyecto (Clean Architecture)

El proyecto sigue una separación clara de responsabilidades:
*   **Capa de Infraestructura / Adaptador (`src/blockchain/blockchain-adapter.service.ts`):** Encapsula todos los detalles técnicos y librerías externas (`ethers.js`), inicializando el proveedor de RPC y conectando con el Smart Contract de USDC.
*   **Capa del Controlador (`src/blockchain/blockchain.controller.ts`):** Actúa como el punto de entrada HTTP (API REST), delegando el procesamiento de datos al servicio y retornando respuestas formateadas en JSON.

---

## 🚀 Requisitos Previos

1.  **Node.js** (v18 o superior recomendado)
2.  Una cuenta gratuita en [Alchemy](https://www.alchemy.com/) o [Infura](https://www.infura.io/) para obtener una API Key de la red de prueba **Ethereum Sepolia**.

---

## ⚙️ Instalación y Configuración

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    Crea una copia de `.env.example` con el nombre `.env`:
    ```bash
    cp .env.example .env
    ```
    Edita el archivo `.env` e introduce tu clave API en la variable `SEPOLIA_RPC_URL`. Ejemplo:
    ```env
    SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TuClaveDeAlchemyAqui
    USDC_CONTRACT_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
    ```

---

## 🏃 Cómo Ejecutar la Aplicación

*   **Modo desarrollo:**
    ```bash
    npm run start:dev
    ```
    La aplicación se iniciará en `http://localhost:3000`.

---

## 📡 Endpoints del API

### 1. Obtener información del Smart Contract de USDC
*   **Método:** `GET`
*   **Ruta:** `/api/token-info`
*   **Descripción:** Consulta directamente el Smart Contract de USDC en Sepolia para obtener el nombre, símbolo y el suministro total (totalSupply) actual.
*   **URL de prueba:** `http://localhost:3000/api/token-info`

### 2. Consultar balance de USDC de una dirección
*   **Método:** `GET`
*   **Ruta:** `/api/balance/:address`
*   **Descripción:** Retorna el saldo actual de USDC de cualquier billetera en la red de Sepolia.
*   **Ejemplo:** `http://localhost:3000/api/balance/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### 3. Consultar detalles de una transacción por Hash
*   **Método:** `GET`
*   **Ruta:** `/api/transaction/:hash`
*   **Descripción:** Consulta los detalles técnicos de una transacción específica en Sepolia (remitente, receptor, valor, gas consumido, y cantidad de confirmaciones de bloque).
*   **Ejemplo:** `http://localhost:3000/api/transaction/0xYourTransactionHashHere`
