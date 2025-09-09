<head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bungee&family=Bungee+Shade&family=Faster+One&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:wght@300;400;700&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Monofett&family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Poiret+One&family=Poppins:wght@100;300;400;700&family=Press+Start+2P&family=Rampart+One&family=Roboto:ital,wght@0,100..900;1,100..900&family=Rubik:ital,wght@0,300..900;1,300..900&family=Tourney:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Turret+Road:wght@200;300;400;500;700;800&family=VT323&display=swap" rel="stylesheet">
</head>

<style>
/* Reset */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "Poppins";
    }

    body {
        font-family: sans-serif;
    }

    .navbar {
        position: fixed;
        top: 0;
        width: 100%;
        background-color: #6CCBFF; 
        z-index: 999;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-radius: 0px 0px 20px 20px;
        overflow: hidden;
    }

    .navbar-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    
    }

    .navbar-logo img {
        height: 50px;
    }

    .navbar-links {
        list-style: none;
        display: flex;
        gap: 30px;
    }

    .navbar-links li a {
        text-decoration: none;
        color: white;
        font-weight: 500;
        font-size: 16px;
    }

    .navbar-profile {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: white;
        font-size: 14px;
    }

    .profile-circle {
        width: 35px;
        height: 35px;
        background-color: white;
        border-radius: 50%;
        margin-bottom: 4px;
    }

    .navbar-links a:hover{
        text-shadow: 2px 2px 4px #000000;
    }
</style>

  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-logo">
        <img src="./assets/Edupath Logo.webp" alt="Logo" />
      </div>

      <!-- Nav Links -->
      <ul class="navbar-links">
        <li><a href="#">Home</a></li>
        <li><a href="#">Tes</a></li>
        <li><a href="#">Jurusan</a></li>
        <li><a href="#">Universitas</a></li>
        <li><a href="#">Konseling</a></li>
      </ul>

      <!-- Profile -->
      <div class="navbar-profile">
        <div class="profile-circle"></div>
        <span>Profil</span>
      </div>
    </div>
  </nav>

