/* Untuk gambar background HP */
#bgImage {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
    pointer-events: none;
    /* Efek lembut agar tidak statis */
    animation: bgBreath 10s ease-in-out infinite alternate;
}

@keyframes bgBreath {
    0% { transform: scale(1); opacity: 0.9; }
    100% { transform: scale(1.03); opacity: 1; }
}
