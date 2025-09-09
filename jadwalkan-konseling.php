<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Jadwalkan Konseling | EduPath</title>
</head>
<style>
    * {
        font-family: "Poppins";
    }

    .title-sub{
        font-weight: 700;
        font-size: 40px;
    }
    /* HERO SECTION */

    .hero-section-title{
        text-shadow: 2px 2px 4px #000000;
    }

    .hero-section{
        background-image: url("assets/Hero Section/Jadwalkan Konseling - Hero.png");
        /* height: 100%;
        max-height: 1080px;
        max-width: 1920px;
        width: 100%;
        background-size: cover;
        background-position: center; 
        background-repeat: no-repeat */
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        width: 100%;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 80px; /* to avoid overlap with navbar if it's fixed */
    }

    .hero-section-content {
        /* padding: 500px;
        width: 100%;
        max-width: 1600px;
        height:100px; */
/* 
        padding: 100px 20px;
        width: 100%;
        max-width: 1600px;
        margin: 0 auto;
        height: auto; */
        display: flex;
        justify-content: space-between;
        width: 60%;
        max-width: 1400px;
        padding: 0 40px;
        flex-direction: column;

    }

    .hero-section-title{
        font-size: 60px;
        color: #FFFFFF;
    }

    .hero-section-subtitle{
        font-size: 20px;
        color: #FFFFFF;
        max-width: 500px;
    }

    .hero-section-button{
        background-color: #6CCBFF;
        width: 206px;
        height: 57px;
        color: white;
        font-size: 20px;
        font-weight: 700px;
        border: none;
        border-radius: 10px;
        box-shadow: 2px 2px 4px #000000;
        margin-top: 10px;
    }

    .hero-section-button:hover{
        cursor: pointer;
        border: 2px solid #6CCBFF;
        color: #6CCBFF;
        background-color: #FFFFFF;
    }

    /* MENGAPA SECTION */
    .mengapa-section-content{
        align-items: center;
        justify-items: center;
        border-radius: 20px;
        height: 100%;
        background-color: #EDF5FF;
        border: 2px solid #3975BF;
        max-width: 1607px;
        width: 100%;
        height: auto;
        padding-top: 30px;
        padding-bottom: 50px;
    }

    .mengapa-section{
        height: 100vh;
        padding: 50px;
    }

    .mengapa-section-title{
        justify-content: center;

    }

    .mengapa-sub{
        font-size: 20px;
        font-weight: 700;
        max-width: 300px;
        text-align: center;
        margin-top: 15px;
    }

    .mengapa-para{
        text-align: center;
        max-width: 400px;
    }

    .mengapa-point{
        justify-items: center;
        align-items: center;
        max-width: 500px;
        justify-content: center;
        display: flex;
        flex-direction: column;
    }
    .mengapa-points-container{
        display: flex;
        padding-top: 60px;
        gap: 40px;
    }
</style>
<body>
    <?php include "navbar.php" ?>
    <div class="hero-section">
        <div class="hero-section-content">
            <h1 class="hero-section-title"><strong>Konseling</strong></h1>
            <p class="hero-section-subtitle">Bicara dengan pihak profesional sekarang. Pastikan bahwa jurusanmu sesuai!</p>
            <button class="hero-section-button"><strong>Jadwalkan sesi</strong></button>
        </div>
    </div>

    <div class="mengapa-section">
        <div class="mengapa-section-content">
            <h2 class="mengapa-title title-sub" style="margin-top: 30px; font-s"><strong>Mengapa Konseling?</strong></h2>
            <div class="mengapa-points-container">
                <div class="mengapa-point">
                    <img src="/assets/Mengapa Section/Jadwalkan Konseling/kesesuaian-minat.png" style="justify-content: center; width: 230px; height: 200px;">
                    <h3 class="mengapa-sub">Kesesuaian antara Minat, Bakat, dan Jurusan</h3>
                    <p class="mengapa-para">Ahli dapat menggunakan tes psikologi atau asesmen minat bakat untuk membantumu memahami kekuatan, kelemahan, dan kecenderungan alami kamu.</p>
                </div>
                <div class="mengapa-point">
                <img src="/assets/Mengapa Section/Jadwalkan Konseling/wawasan-karier.png" style="justify-content: center; width: 230px; height: 200px;">
                    <h3 class="mengapa-sub">Wawasan Karier Jangka Panjang</h3>
                    <p class="mengapa-para">Seorang konselor berpengalaman tidak hanya membahas jurusan, tapi juga prospek kerja, tren industri, dan bagaimana sebuah jurusan bisa mengarahkanmu ke karier tertentu.</p></div>
                <div class="mengapa-point">
                <img src="/assets/Mengapa Section/Jadwalkan Konseling/tidak-penyesalan.png" style="justify-content: center; width: 230px; height: 200px;">
                    <h3 class="mengapa-sub">Tidak Ada Penyesalan di Tengah Jalan</h3>
                    <p class="mengapa-para">Dengan sesi konsultasi, kamu bisa lebih siap membuat keputusan sejak awal, menghemat waktu, tenaga, dan biaya selama masa studi.</p>
                </div>
            </div>
        </div>
    </div>
</bodY>
