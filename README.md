# 🧏‍♂️ Plataforma Educativa de Lengua de Signos – Proyecto WebGL 3D
## 📽️ Presentación del proyecto
(https://drive.google.com/file/d/1luvsQLjod5oFeX4BhM9njO-V1fRBBhw-/view?usp=sharing)

## ⭐ Esta web ha recibido el Premio de Accesibilidad 2025 de los Premios Impulso, por la Universidad de Alicante
(https://vertice.cpd.ua.es/304879)

## ✨ Descripción del proyecto
Este proyecto consiste en el **desarrollo de una página web educativa** diseñada para el **aprendizaje de la lengua de signos** mediante un **avatar 3D animado**.
La plataforma utiliza el avatar 3D creado con **Blender**, el cual reproduce distintos signos mediante animaciones por huesos.  
Para lograr animaciones **más dinámicas y fluidas**, se ha desarrollado un **motor gráfico propio** con **WebGL** para controlar los movimientos del esqueleto y las poses del avatar.

## 🛠️ Tecnologías utilizadas
- 🧱 **Angular / Node / Express** – Base del proyecto web (IU).
- 🕹️ **WebGL** – Motor gráfico para animaciones por huesos.
- 🧑‍🎨 **Blender** – Creación y animación del avatar 3D.
- 🌀 **glTF** – Formato de exportación de modelos 3D.

## 🧩 Funcionalidades destacadas
- Renderizado 3D en tiempo real en navegador.  
- Sistema de animaciones esqueléticas dinámicas.  
- Interfaz web educativa para el aprendizaje de signos.  
- Integración del avatar 3D con un motor propio.

---

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/usuario/Graphicare_ABP24.git
cd Graphicare_ABP24
```

### 2. Configuración del backend
1. Instala las dependencias:
   ```bash
   cd backend
   npm install
   ```
2. Crea el archivo `.env` con las siguientes variables de ejemplo:
   ```env
   PORT=3000
   DBCONNECTION=mongodb://localhost:27017/miBaseDeDatos
   JWTSECRET=miClaveSecreta
   DOCSPERPAGE=20
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```

### 3. Configuración del frontend
1. Instala las dependencias:
   ```bash
   cd frontend
   npm install
   ```
2. Inicia el servidor:
   ```bash
   ng serve
   ```

---

## 👥 Proyecto colaborativo
Este proyecto fue desarrollado en equipo junto con otros estudiantes.

**Formé parte del desarrollo de:**
- Creación del modelado avatar y sus animaciones.
- Implementación del sistema de animación por huesos.
- Integración de modelos glTF en el motor gráfico.
- Optimización del renderizado en WebGL.

## Contribuidores del equipo GraphiCare
- **Ángel Manuel Ruiz Freeman**.
- **Lorena Heras Caballero**.
- **Yousra El Jaafari El Idrissi**.
- **Sebastián Ayala García**.
- **Adrián Guerras Algarra**.

## 📜 Licencia
Este proyecto fue desarrollado en un entorno académico y se comparte únicamente con fines demostrativos.
