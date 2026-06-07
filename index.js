<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>VisEdit</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0; padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            user-select: none;
            -webkit-user-select: none;
        }
        :root {
            --bg-dark:      #0e0c0a;
            --bg-card:      #1a1714;
            --bg-surface:   #201d19;
            --text-dim:     #7a7065;
            --text-soft:    #a89880;
            --gold:         #c9a96e;
            --gold-light:   #e8cc99;
            --gold-dim:     #8a6e44;
            --ivory:        #f5f0e8;
            --ivory-dim:    #d4cbbf;
            --accent:       #c9a96e;
            --accent-glow:  rgba(201,169,110,0.25);
            --border:       rgba(201,169,110,0.18);
            --border-soft:  rgba(201,169,110,0.10);
        }

        html, body {
            width: 100%; height: 100%;
            overflow: hidden;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--ivory);
            font-family: 'Rajdhani', sans-serif;
        }

        /* =========================================
           SWIPE CONTAINER — 2 halaman horizontal
           Pakai will-change & translateZ untuk GPU
        ========================================= */
        #app-wrapper {
            display: flex;
            width: 200%;
            height: 100%;
            /* GPU compositing: jauh lebih smooth dari transition CSS biasa */
            will-change: transform;
            transform: translateX(0) translateZ(0);
            transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        }
        #app-wrapper.show-gallery {
            transform: translateX(-50%) translateZ(0);
        }

        .page {
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            overflow: hidden;
            /* GPU layer per halaman */
            transform: translateZ(0);
            backface-visibility: hidden;
        }

        /* === BACKGROUND AMBIENCE — Elegant Landscape === */
        .page-main {
            background-color: var(--bg-dark);
            position: relative;
        }
        /* Layer 1: Langit gradasi senja elegan */
        .page-main-bg {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        }
        /* SVG pemandangan langit + pegunungan siluet */
        .page-main-bg::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
                /* Langit senja atas */
                linear-gradient(175deg,
                    #0a0806 0%,
                    #1a1008 18%,
                    #2d1a0e 30%,
                    #3d2512 38%,
                    #2a1a1a 50%,
                    #1a1214 65%,
                    #0e0c0a 100%
                );
        }
        /* Cahaya horizon emas keemasan */
        .page-main-bg::after {
            content: '';
            position: absolute;
            inset: 0;
            background:
                radial-gradient(ellipse 80% 28% at 50% 52%,
                    rgba(201,169,110,0.18) 0%,
                    rgba(180,100,40,0.10) 40%,
                    transparent 70%
                ),
                radial-gradient(ellipse 45% 20% at 25% 48%,
                    rgba(220,140,60,0.10) 0%,
                    transparent 60%
                ),
                radial-gradient(ellipse 45% 20% at 75% 48%,
                    rgba(220,140,60,0.08) 0%,
                    transparent 60%
                ),
                /* Bintang halus di langit atas */
                radial-gradient(ellipse 100% 45% at 50% 10%,
                    rgba(245,240,232,0.03) 0%,
                    transparent 100%
                );
        }
        /* Siluet pegunungan & lanskap SVG inline */
        .landscape-svg {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            width: 100%; height: 62%;
            pointer-events: none;
            z-index: 1;
        }
        /* Overlay vignette atas & bawah supaya konten tetap terbaca */
        .page-main-vignette {
            position: absolute;
            inset: 0;
            background:
                linear-gradient(to bottom,
                    rgba(10,8,6,0.60) 0%,
                    rgba(10,8,6,0.0) 28%,
                    rgba(10,8,6,0.0) 55%,
                    rgba(10,8,6,0.75) 100%
                );
            pointer-events: none;
            z-index: 2;
        }

        /* --- HEADER (shared style) --- */
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 22px;
            background-color: rgba(14,12,10,0.94);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border);
            position: relative;
            z-index: 10;
            flex-shrink: 0;
        }

        .logo {
            font-family: 'Cormorant Garamond', 'Orbitron', serif;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 5px;
            background: linear-gradient(135deg, #c9a96e, #f5dea8, #c9a96e, #8a6e44);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            filter: drop-shadow(0 1px 8px rgba(201,169,110,0.30));
        }

        .nav-links {
            font-size: 11px;
            color: var(--text-dim);
            letter-spacing: 2px;
            font-family: 'Cormorant Garamond', serif;
        }

        /* =========== PAGE 1 — MAIN =========== */
        .page-main main {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
            z-index: 3;
            padding: 16px;
            gap: 16px;
        }

        /* === GRID 2x2 === */
        .btn-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
        }

        /* === GLOW BOX (classic gold border) === */
        .glow-box {
            position: relative;
            border-radius: 16px;
        }
        .glow-box::before {
            content: '';
            position: absolute; inset: -1.5px;
            border-radius: 18px;
            background: linear-gradient(135deg, #c9a96e, #8a6e44, #f5dea8, #8a6e44, #c9a96e);
            background-size: 300% 300%;
            animation: gradientShift 6s ease infinite;
            z-index: -1; opacity: 0.65;
        }
        @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* === CARD BUTTON === */
        .card-btn {
            width: 115px; height: 108px;
            background: linear-gradient(160deg, #1e1a15, #141210);
            border-radius: 16px;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            cursor: pointer;
            transition: transform 0.18s ease;
            gap: 9px;
            box-shadow: inset 0 1px 0 rgba(201,169,110,0.07), 0 4px 16px rgba(0,0,0,0.5);
        }
        .card-btn:active { transform: scale(0.94); }

        .card-icon { width: 26px; height: 26px; }
        .card-label {
            font-size: 10px; color: var(--text-soft);
            text-transform: uppercase; letter-spacing: 1.4px;
            font-weight: 600; text-align: center; line-height: 1.3;
        }

        .icon-purple { color: var(--gold); }
        .icon-green  { color: var(--gold-light); }
        .icon-blue   { color: #c4a882; }
        .icon-rose   { color: #d4987a; }

        /* Hidden inputs */
        #file-input { display: none; }

        /* =========================================
           AREA BAWAH — Edit & Galeri Logo
        ========================================= */
        .bottom-nav {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0;
            padding: 0 20px 6px;
            position: relative;
            z-index: 5;
            flex-shrink: 0;
        }
        .bottom-nav-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            padding: 10px 8px;
            cursor: pointer;
            border-radius: 14px;
            transition: background 0.2s;
            position: relative;
            max-width: 110px;
        }
        .bottom-nav-item.active-tab {
            background: rgba(201,169,110,0.08);
        }
        .bottom-nav-item:active {
            background: rgba(201,169,110,0.12);
        }
        .bottom-nav-icon {
            width: 26px; height: 26px;
            display: flex; align-items: center; justify-content: center;
        }
        .bottom-nav-icon svg { width: 22px; height: 22px; }
        .bottom-nav-label {
            font-size: 9px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            font-weight: 600;
            color: var(--text-dim);
            transition: color 0.2s;
        }
        .bottom-nav-item.active-tab .bottom-nav-label { color: var(--gold); }
        .bottom-nav-item.active-tab .bottom-nav-icon svg { 
            filter: drop-shadow(0 0 5px rgba(201,169,110,0.60));
        }
        .bottom-nav-dot {
            position: absolute;
            top: 6px; right: 16px;
            width: 5px; height: 5px;
            border-radius: 50%;
            background: var(--gold);
            display: none;
        }
        .bottom-nav-item.active-tab .bottom-nav-dot { display: block; }
        .bottom-nav-divider {
            width: 1px; height: 32px;
            background: rgba(255,255,255,0.06);
            flex-shrink: 0;
        }

        /* Footer */
        footer {
            text-align: center; padding: 6px;
            font-size: 9px; color: #3a3020;
            background-color: rgba(10,8,6,0.95);
            letter-spacing: 2px; position: relative; z-index: 10;
            flex-shrink: 0;
            font-family: 'Cormorant Garamond', serif;
        }

        /* --- SWIPE INDICATOR (page 1) --- */
        .swipe-hint {
            position: absolute;
            right: 10px; top: 50%;
            transform: translateY(-50%);
            display: flex; flex-direction: column;
            align-items: center; gap: 4px;
            opacity: 0.25;
            z-index: 5;
            pointer-events: none;
        }
        .swipe-hint svg { width: 14px; height: 14px; color: #a78bfa; }
        .swipe-hint span { font-size: 7px; color: var(--text-dim); letter-spacing: 1px; writing-mode: vertical-rl; }

        /* =========================================
           PAGE 2 — GALERI HASIL EDIT
        ========================================= */
        .page-gallery {
            background-color: #0a0806;
        }
        .page-gallery header {
            border-bottom-color: var(--border);
        }
        .gallery-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 4px;
            background: linear-gradient(135deg, var(--gold-light), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .gallery-back {
            font-size: 11px; color: var(--text-dim);
            cursor: pointer; letter-spacing: 1px;
            display: flex; align-items: center; gap: 4px;
            transition: color 0.2s;
        }
        .gallery-back:active { color: var(--gold); }
        .gallery-back svg { width: 14px; height: 14px; }

        /* Gallery body */
        .gallery-body {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            position: relative;
            z-index: 1;
            -webkit-overflow-scrolling: touch;
        }
        .gallery-body::-webkit-scrollbar { width: 3px; }
        .gallery-body::-webkit-scrollbar-track { background: transparent; }
        .gallery-body::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 2px; }

        /* Empty state */
        .gallery-empty {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            height: 100%;
            gap: 14px;
            opacity: 0.45;
        }
        .gallery-empty svg { width: 48px; height: 48px; color: #2a2a3a; }
        .gallery-empty p {
            font-size: 12px; color: var(--text-dim);
            text-transform: uppercase; letter-spacing: 1.5px;
            text-align: center; line-height: 1.6;
        }

        /* Grid foto hasil */
        .gallery-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .gallery-item {
            position: relative;
            border-radius: 14px;
            overflow: hidden;
            aspect-ratio: 1;
            cursor: pointer;
            background: var(--bg-card);
            box-shadow: 0 2px 12px rgba(0,0,0,0.5);
            transition: transform 0.18s ease;
            border: 1px solid var(--border-soft);
        }
        .gallery-item:active { transform: scale(0.96); }
        .gallery-item img {
            width: 100%; height: 100%;
            object-fit: cover;
            display: block;
        }
        .gallery-item-label {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            background: linear-gradient(transparent, rgba(0,0,0,0.80));
            padding: 22px 8px 7px;
            font-size: 9px; color: #d0d4de;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }
        .gallery-item-del {
            position: absolute;
            top: 7px; right: 7px;
            width: 24px; height: 24px;
            background: rgba(0,0,0,0.60);
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            border: 1px solid rgba(248,113,113,0.25);
        }
        .gallery-item-del svg { width: 11px; height: 11px; color: #f87171; }

        /* ============================================
           POPUP GABUNGKAN
        ============================================ */
        .popup-overlay {
            display: none;
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.70);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            z-index: 200;
            justify-content: center;
            align-items: flex-end;
            padding-bottom: 32px;
        }
        .popup-overlay.active { display: flex; }

        .popup-sheet {
            background: #1a1714;
            border-radius: 24px 24px 16px 16px;
            padding: 20px 20px 22px;
            width: min(360px, 95vw);
            border: 1px solid var(--border);
            animation: slideUp 0.28s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes slideUp {
            from { transform: translateY(60px); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
        }

        .popup-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 13px; letter-spacing: 4px;
            background: linear-gradient(135deg, var(--gold-light), var(--gold), var(--gold-dim));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-align: center; margin-bottom: 16px;
        }

        .popup-options { display: flex; flex-direction: column; gap: 9px; }

        .popup-btn {
            display: flex; align-items: center; gap: 14px;
            background: var(--bg-surface);
            border-radius: 14px;
            padding: 12px 15px;
            cursor: pointer;
            position: relative; overflow: hidden;
            transition: transform 0.15s ease, background 0.15s;
            border: 1px solid var(--border-soft);
        }
        .popup-btn:active { transform: scale(0.97); background: #111009; }

        .popup-btn-inner {
            display: flex; align-items: center; gap: 13px;
            position: relative; z-index: 1; width: 100%;
        }
        .popup-btn-icon {
            width: 38px; height: 38px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .popup-btn-icon svg { width: 20px; height: 20px; }

        .icon-bg-2 { background: rgba(201,169,110,0.10); }
        .icon-bg-3 { background: rgba(196,168,130,0.10); }
        .icon-bg-4 { background: rgba(212,152,122,0.10); }

        .popup-btn-label { font-size: 13px; font-weight: 600; color: var(--ivory-dim); letter-spacing: 0.5px; }
        .popup-btn-sub   { font-size: 10px; color: var(--text-dim); margin-top: 1px; }

        .popup-close {
            margin-top: 13px; text-align: center;
            font-size: 11px; color: var(--text-dim);
            cursor: pointer; letter-spacing: 1px;
            text-transform: uppercase; transition: color 0.2s;
        }
        .popup-close:active { color: var(--text-soft); }

        /* ============================================
           LAYAR PILIH FOTO GABUNGAN — phase 1
        ============================================ */
        #merge-pick {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 500;
            background: #0d0b08;
            flex-direction: column;
            overflow: hidden;
        }
        #merge-pick.active { display: flex; }
        #merge-pick header {
            border-bottom-color: var(--border);
            padding: 12px 16px;
        }

        .pick-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 20px 10px;
            gap: 16px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }
        .pick-info {
            font-size: 11px;
            color: var(--text-dim);
            letter-spacing: 1px;
            text-align: center;
        }
        .pick-slots {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            width: 100%;
        }
        .pick-slot {
            width: calc(50% - 6px);
            max-width: 160px;
            aspect-ratio: 1;
            border-radius: 16px;
            background: #0e0b09;
            border: 2px dashed #2a2018;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: border-color 0.2s, background 0.2s;
        }
        .pick-slot:active { background: #1a150f; }
        .pick-slot.filled { border: 2px solid rgba(201,169,110,0.35); }
        .pick-slot.filled:active { opacity: 0.85; }
        .pick-slot-img {
            width: 100%; height: 100%;
            object-fit: cover;
            display: none;
            border-radius: 14px;
        }
        .pick-slot.filled .pick-slot-img { display: block; }
        .pick-slot.filled .pick-slot-placeholder { display: none; }
        .pick-slot-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .pick-slot-placeholder svg {
            width: 28px; height: 28px;
            color: #3a3a5a;
        }
        .pick-slot-num {
            font-size: 9px;
            color: #3a3a5a;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }
        .pick-slot-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.45);
            display: none;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
        }
        .pick-slot.filled .pick-slot-overlay { display: flex; }
        .pick-slot-change {
            font-size: 9px;
            color: #fff;
            letter-spacing: 1px;
            text-transform: uppercase;
            background: rgba(0,0,0,0.5);
            padding: 4px 10px;
            border-radius: 10px;
        }
        .pick-slot-check {
            position: absolute;
            top: 7px; right: 7px;
            width: 20px; height: 20px;
            background: var(--gold);
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .pick-slot.filled .pick-slot-check { display: flex; }
        .pick-slot-check svg { width: 11px; height: 11px; color: #000; }

        .pick-actions {
            flex-shrink: 0;
            display: flex;
            gap: 10px;
            padding: 12px 20px 24px;
        }
        .btn-pick-batal {
            flex: 1;
            padding: 14px;
            border-radius: 14px;
            font-family: 'Rajdhani', sans-serif;
            font-size: 13px; font-weight: 600;
            letter-spacing: 1.5px; text-transform: uppercase;
            cursor: pointer;
            border: 1px solid #2a2018;
            background: #0e0b09;
            color: #c4806a;
            transition: background 0.15s;
        }
        .btn-pick-batal:active { background: #1a0f0c; }
        .btn-pick-gabung {
            flex: 2;
            padding: 14px;
            border-radius: 14px;
            font-family: 'Rajdhani', sans-serif;
            font-size: 13px; font-weight: 600;
            letter-spacing: 1.5px; text-transform: uppercase;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #8a6e44, #c9a96e);
            color: #0e0b09;
            transition: opacity 0.2s;
            opacity: 0.38;
            pointer-events: none;
        }
        .btn-pick-gabung.ready {
            opacity: 1;
            pointer-events: auto;
        }
        .btn-pick-gabung:active { opacity: 0.75; }

        /* ============================================
           LAYAR EDIT GABUNGAN — phase 2
        ============================================ */
        #merge-editor {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 500;
            background: #0d0b08;
            flex-direction: column;
            overflow: hidden;
        }
        #merge-editor.active { display: flex; }
        #merge-editor header {
            border-bottom-color: var(--border);
            gap: 0;
            padding: 12px 16px;
        }
        .editor-back {
            font-size: 11px; color: var(--text-dim);
            cursor: pointer; letter-spacing: 1px;
            display: flex; align-items: center; gap: 4px;
        }
        .editor-back svg { width: 14px; height: 14px; }
        .editor-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 12px;
            letter-spacing: 3px;
            background: linear-gradient(135deg, var(--gold-light), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Preview area */
        .editor-preview {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 16px;
            position: relative;
        }
        #preview-canvas {
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            object-fit: contain;
            box-shadow: 0 0 30px rgba(0,0,0,0.6);
            display: block;
        }

        /* Gaya / style selector */
        .style-section {
            flex-shrink: 0;
            padding: 10px 16px 6px;
        }
        .style-section-label {
            font-size: 9px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: var(--text-dim);
            margin-bottom: 8px;
        }
        .style-scroll {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 4px;
        }
        .style-scroll::-webkit-scrollbar { display: none; }
        .style-chip {
            flex-shrink: 0;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            font-weight: 600;
            cursor: pointer;
            border: 1px solid #2a2018;
            background: #0e0b09;
            color: var(--text-dim);
            transition: all 0.15s ease;
        }
        .style-chip.active {
            background: rgba(201,169,110,0.12);
            border-color: var(--gold-dim);
            color: var(--gold);
        }
        .style-chip:active { opacity: 0.7; }

        /* Tombol bawah: Ubah & Simpan */
        .editor-actions {
            flex-shrink: 0;
            display: flex;
            gap: 10px;
            padding: 12px 16px 20px;
        }
        .btn-buang {
            flex: 1;
            padding: 14px;
            border-radius: 14px;
            font-family: 'Rajdhani', sans-serif;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            border: 1px solid #2a2018;
            background: #0e0b09;
            color: #c4806a;
            transition: background 0.15s;
        }
        .btn-buang:active { background: #1a0f0c; }
        .btn-simpan {
            flex: 2;
            padding: 14px;
            border-radius: 14px;
            font-family: 'Rajdhani', sans-serif;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            border: none;
            background: linear-gradient(135deg, #8a6e44, #c9a96e);
            color: #0e0b09;
            transition: opacity 0.15s;
        }
        .btn-simpan:active { opacity: 0.8; }

        /* ============================================
           TOAST
        ============================================ */
        .toast {
            position: fixed;
            bottom: 32px; left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #1a1510;
            border: 1px solid rgba(201,169,110,0.35);
            color: var(--ivory-dim);
            font-size: 12px;
            padding: 10px 20px;
            border-radius: 20px;
            letter-spacing: 0.5px;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 600;
            white-space: nowrap;
            pointer-events: none;
        }
        .toast.show {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }

        /* Loading overlay di editor */
        #editor-loading {
            display: none;
            position: absolute;
            inset: 0;
            background: rgba(8,8,14,0.85);
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 10px;
        }
        #editor-loading.active { display: flex; }
        .spinner {
            width: 32px; height: 32px;
            border: 2px solid rgba(201,169,110,0.15);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ============================================
           INTRO SPLASH SCREEN
        ============================================ */
        #intro-splash {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: #08060404;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            animation: splashFadeOut 0.5s ease 2s forwards;
            pointer-events: auto;
            background-color: #07060404;
            background: radial-gradient(ellipse 80% 60% at 50% 70%, #1a1208 0%, #07060404 100%);
            background-color: #070605;
        }
        #intro-splash.hidden { display: none; }
        @keyframes splashFadeOut {
            to { opacity: 0; pointer-events: none; }
        }
        .splash-logo {
            font-family: 'Cormorant Garamond', serif;
            font-size: 44px;
            font-weight: 700;
            letter-spacing: 10px;
            background: linear-gradient(135deg, #8a6e44, #f5dea8, #c9a96e, #8a6e44);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            filter: drop-shadow(0 2px 18px rgba(201,169,110,0.40));
            animation: splashPulse 1.4s ease-in-out infinite alternate;
        }
        @keyframes splashPulse {
            from { filter: drop-shadow(0 2px 10px rgba(201,169,110,0.30)); }
            to   { filter: drop-shadow(0 2px 28px rgba(245,222,168,0.60)); }
        }
        .splash-tagline {
            font-size: 10px;
            color: var(--gold-dim);
            letter-spacing: 5px;
            text-transform: uppercase;
            font-family: 'Cormorant Garamond', serif;
            animation: splashSlideUp 0.7s ease 0.3s both;
        }
        .splash-bar {
            width: 60px;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--gold), transparent);
            border-radius: 1px;
            margin-top: 8px;
            animation: splashBarGrow 1.5s ease 0.4s both;
            transform-origin: left;
        }
        @keyframes splashSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBarGrow {
            from { transform: scaleX(0); opacity: 0; }
            to   { transform: scaleX(1); opacity: 1; }
        }

        /* ============================================
           LIGHTBOX — SWIPE CAROUSEL
        ============================================ */
        #lightbox {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 800;
            background: #05050c;
            flex-direction: column;
            overflow: hidden;
        }
        #lightbox.active { display: flex; }

        .lightbox-header {
            position: absolute;
            top: 0; left: 0; right: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 16px;
            background: linear-gradient(to bottom, rgba(5,5,12,0.9) 60%, transparent);
            z-index: 5;
        }
        .lightbox-close {
            width: 38px; height: 38px;
            border-radius: 50%;
            background: rgba(255,255,255,0.10);
            border: 1px solid rgba(255,255,255,0.08);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
        }
        .lightbox-close:active { background: rgba(255,255,255,0.20); }
        .lightbox-close svg { width: 16px; height: 16px; color: #e0e4ef; }

        .lightbox-counter {
            font-size: 11px;
            color: rgba(255,255,255,0.55);
            letter-spacing: 2px;
            font-weight: 600;
            background: rgba(0,0,0,0.35);
            padding: 4px 12px;
            border-radius: 20px;
        }
        .lightbox-title {
            font-size: 9px;
            color: rgba(255,255,255,0.4);
            letter-spacing: 1px;
            text-transform: uppercase;
            max-width: 70px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: right;
        }

        /* Carousel track */
        .lightbox-track-wrap {
            flex: 1;
            overflow: hidden;
            position: relative;
            display: flex;
            align-items: center;
        }
        .lightbox-track {
            display: flex;
            height: 100%;
            will-change: transform;
            transition: transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94);
        }
        .lightbox-slide {
            flex-shrink: 0;
            width: 100vw;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 68px 12px 110px;
        }
        .lightbox-slide img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            object-fit: contain;
            box-shadow: 0 8px 40px rgba(0,0,0,0.7);
            display: block;
        }

        /* Dots indicator */
        .lightbox-dots {
            position: absolute;
            bottom: 88px; left: 0; right: 0;
            display: flex;
            justify-content: center;
            gap: 6px;
            z-index: 5;
            pointer-events: none;
        }
        .lb-dot {
            width: 5px; height: 5px;
            border-radius: 50%;
            background: rgba(255,255,255,0.25);
            transition: all 0.25s ease;
        }
        .lb-dot.active {
            background: var(--gold);
            width: 16px;
            border-radius: 3px;
        }

        /* Footer */
        .lightbox-footer {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            padding: 14px 20px 30px;
            background: linear-gradient(to top, rgba(5,5,12,0.95) 70%, transparent);
            z-index: 5;
        }
        .btn-unduh {
            display: flex;
            align-items: center;
            gap: 9px;
            padding: 13px 30px;
            border-radius: 50px;
            background: linear-gradient(135deg, #8a6e44, #c9a96e);
            color: #0e0b09;
            font-family: 'Rajdhani', sans-serif;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 18px rgba(201,169,110,0.30);
            transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
        }
        .btn-unduh:active { transform: scale(0.95); opacity: 0.85; }
        .btn-unduh svg { width: 16px; height: 16px; }

        /* ============================================
           POPUP UNDUH — FORMAT & RESOLUSI
        ============================================ */
        #unduh-popup {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 900;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            justify-content: flex-end;
            align-items: flex-end;
        }
        #unduh-popup.active { display: flex; }

        .unduh-sheet {
            background: #151210;
            border-radius: 24px 24px 0 0;
            padding: 20px 20px 36px;
            width: 100%;
            border-top: 1px solid var(--border);
            animation: slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1);
        }
        .unduh-handle {
            width: 36px; height: 4px;
            background: rgba(255,255,255,0.15);
            border-radius: 2px;
            margin: 0 auto 18px;
        }
        .unduh-title {
            font-family: 'Cormorant Garamond', serif;
            font-size: 12px;
            letter-spacing: 3px;
            background: linear-gradient(135deg, var(--gold-light), var(--gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-align: center;
            margin-bottom: 18px;
        }
        .unduh-section-label {
            font-size: 9px;
            color: var(--text-dim);
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 9px;
        }
        .unduh-row {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        .unduh-chip {
            flex: 1;
            min-width: 60px;
            padding: 10px 6px;
            border-radius: 12px;
            background: rgba(201,169,110,0.04);
            border: 1.5px solid var(--border-soft);
            text-align: center;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .unduh-chip.selected {
            background: rgba(201,169,110,0.12);
            border-color: var(--gold-dim);
        }
        .unduh-chip:active { transform: scale(0.96); }
        .unduh-chip-main {
            font-size: 12px;
            font-weight: 700;
            color: var(--ivory-dim);
            letter-spacing: 0.5px;
        }
        .unduh-chip.selected .unduh-chip-main { color: var(--gold); }
        .unduh-chip-sub {
            font-size: 9px;
            color: var(--text-dim);
            margin-top: 2px;
            letter-spacing: 0.5px;
        }
        .btn-unduh-confirm {
            width: 100%;
            padding: 15px;
            border-radius: 16px;
            background: linear-gradient(135deg, #8a6e44, #c9a96e);
            color: #0e0b09;
            font-family: 'Rajdhani', sans-serif;
            font-size: 14px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 18px rgba(124,58,237,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-top: 4px;
            transition: opacity 0.15s;
        }
        .btn-unduh-confirm:active { opacity: 0.8; }
        .btn-unduh-confirm svg { width: 16px; height: 16px; }
        .unduh-cancel {
            text-align: center;
            margin-top: 12px;
            font-size: 11px;
            color: var(--text-dim);
            cursor: pointer;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .unduh-cancel:active { color: #f87171; }
        /* ============================================
           RECENT PHOTOS — 3 foto terbaru di main page
        ============================================ */
        .recent-section {
            width: 100%;
            max-width: 280px;
            position: relative;
            z-index: 3;
        }
        .recent-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 9px;
            padding: 0 2px;
        }
        .recent-label {
            font-family: 'Cormorant Garamond', serif;
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--gold-dim);
        }
        .recent-see-all {
            font-size: 9px;
            letter-spacing: 1.5px;
            color: var(--text-dim);
            text-transform: uppercase;
            cursor: pointer;
            transition: color 0.2s;
            border-bottom: 1px solid rgba(201,169,110,0.20);
            padding-bottom: 1px;
        }
        .recent-see-all:active { color: var(--gold); }
        .recent-row {
            display: flex;
            gap: 8px;
            width: 100%;
        }
        .recent-thumb {
            flex: 1;
            aspect-ratio: 1;
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            background: var(--bg-card);
            border: 1px solid var(--border-soft);
            position: relative;
            transition: transform 0.16s ease, border-color 0.2s;
        }
        .recent-thumb:active { transform: scale(0.93); }
        .recent-thumb:hover  { border-color: var(--border); }
        .recent-thumb img {
            width: 100%; height: 100%;
            object-fit: cover;
            display: block;
        }
        /* Divider elegan antara grid tombol dan recent */
        .recent-divider {
            width: 100%;
            max-width: 280px;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--border), transparent);
            margin-bottom: 0;
            position: relative;
            z-index: 3;
        }
    </style>
</head>
<body>

<!-- ===== INTRO SPLASH ===== -->
<div id="intro-splash">
    <div class="splash-logo">VisEdit</div>
    <div class="splash-tagline">Edit Foto Mudah &amp; Cepat</div>
    <div class="splash-bar"></div>
</div>

<!-- ===== LIGHTBOX CAROUSEL ===== -->
<div id="lightbox">
    <div class="lightbox-header">
        <div class="lightbox-close" onclick="closeLightbox()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </div>
        <div class="lightbox-counter" id="lightbox-counter">1 / 1</div>
        <div class="lightbox-title" id="lightbox-title">Foto</div>
    </div>

    <div class="lightbox-track-wrap" id="lb-track-wrap">
        <div class="lightbox-track" id="lb-track">
            <!-- slides diisi JS -->
        </div>
    </div>

    <div class="lightbox-dots" id="lb-dots"></div>

    <div class="lightbox-footer">
        <button class="btn-unduh" onclick="openUnduhPopup()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Unduh Foto
        </button>
    </div>
</div>

<!-- ===== POPUP PILIHAN UNDUH ===== -->
<div id="unduh-popup" onclick="closeUnduhOnOverlay(event)">
    <div class="unduh-sheet">
        <div class="unduh-handle"></div>
        <div class="unduh-title">PILIH FORMAT UNDUHAN</div>

        <div class="unduh-section-label">Format File</div>
        <div class="unduh-row" id="unduh-format-row">
            <div class="unduh-chip selected" data-fmt="jpeg" onclick="selectUnduhChip(this,'fmt')">
                <div class="unduh-chip-main">JPEG</div>
                <div class="unduh-chip-sub">Ukuran kecil</div>
            </div>
            <div class="unduh-chip" data-fmt="png" onclick="selectUnduhChip(this,'fmt')">
                <div class="unduh-chip-main">PNG</div>
                <div class="unduh-chip-sub">Tanpa kompresi</div>
            </div>
            <div class="unduh-chip" data-fmt="webp" onclick="selectUnduhChip(this,'fmt')">
                <div class="unduh-chip-main">WEBP</div>
                <div class="unduh-chip-sub">Modern &amp; ringan</div>
            </div>
        </div>

        <div class="unduh-section-label">Resolusi</div>
        <div class="unduh-row" id="unduh-res-row">
            <div class="unduh-chip selected" data-res="1" onclick="selectUnduhChip(this,'res')">
                <div class="unduh-chip-main">Asli</div>
                <div class="unduh-chip-sub">100%</div>
            </div>
            <div class="unduh-chip" data-res="2" onclick="selectUnduhChip(this,'res')">
                <div class="unduh-chip-main">HD</div>
                <div class="unduh-chip-sub">2× ukuran</div>
            </div>
            <div class="unduh-chip" data-res="0.5" onclick="selectUnduhChip(this,'res')">
                <div class="unduh-chip-main">Hemat</div>
                <div class="unduh-chip-sub">50%</div>
            </div>
        </div>

        <button class="btn-unduh-confirm" onclick="doUnduh()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Unduh Sekarang
        </button>
        <div class="unduh-cancel" onclick="closeUnduhPopup()">✕ &nbsp;Batal</div>
    </div>
</div>

<div id="app-wrapper">

    <!-- ============================
         PAGE 1 — HALAMAN UTAMA
    ============================= -->
    <div class="page page-main">
        <div class="page-main-bg">
            <!-- SVG Landscape siluet: gunung + pohon + bulan -->
            <svg class="landscape-svg" viewBox="0 0 400 280" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#3d2010" stop-opacity="0.0"/>
                        <stop offset="60%" stop-color="#4a2810" stop-opacity="0.25"/>
                        <stop offset="100%" stop-color="#1a0d06" stop-opacity="0.70"/>
                    </linearGradient>
                    <linearGradient id="mountGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#1a1008"/>
                        <stop offset="100%" stop-color="#0a0806"/>
                    </linearGradient>
                    <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#c9a96e" stop-opacity="0.20"/>
                        <stop offset="100%" stop-color="#c9a96e" stop-opacity="0"/>
                    </linearGradient>
                    <filter id="blur2">
                        <feGaussianBlur stdDeviation="2"/>
                    </filter>
                </defs>
                <!-- Cahaya horizon keemasan -->
                <ellipse cx="200" cy="155" rx="280" ry="40" fill="url(#horizonGlow)" filter="url(#blur2)"/>
                <!-- Bulan sabit kecil -->
                <circle cx="320" cy="55" r="16" fill="#e8cc99" opacity="0.20"/>
                <circle cx="328" cy="52" r="14" fill="#1a1008" opacity="0.85"/>
                <!-- Bintang-bintang kecil -->
                <circle cx="40"  cy="30"  r="1"   fill="#e8cc99" opacity="0.35"/>
                <circle cx="95"  cy="18"  r="0.8" fill="#e8cc99" opacity="0.28"/>
                <circle cx="150" cy="40"  r="1.2" fill="#e8cc99" opacity="0.22"/>
                <circle cx="230" cy="22"  r="0.9" fill="#e8cc99" opacity="0.30"/>
                <circle cx="290" cy="38"  r="1"   fill="#e8cc99" opacity="0.18"/>
                <circle cx="355" cy="80"  r="0.7" fill="#e8cc99" opacity="0.25"/>
                <circle cx="70"  cy="70"  r="0.8" fill="#e8cc99" opacity="0.20"/>
                <circle cx="180" cy="12"  r="0.7" fill="#e8cc99" opacity="0.28"/>
                <!-- Pegunungan jauh (layer 3 — terang sedikit) -->
                <path d="M0 180 L60 115 L120 160 L180 100 L240 150 L300 110 L360 145 L400 120 L400 280 L0 280 Z"
                      fill="#12100d" opacity="0.7"/>
                <!-- Pegunungan tengah (layer 2) -->
                <path d="M0 200 L50 145 L100 180 L160 125 L220 165 L280 135 L340 170 L400 145 L400 280 L0 280 Z"
                      fill="#0e0c09" opacity="0.85"/>
                <!-- Perbukitan depan (layer 1 — paling gelap) -->
                <path d="M0 230 L70 185 L130 218 L200 175 L260 210 L330 188 L400 215 L400 280 L0 280 Z"
                      fill="#0a0806"/>
                <!-- Pohon-pohon siluet di kiri -->
                <rect x="10" y="210" width="4" height="40" fill="#09080600" rx="2"/>
                <ellipse cx="12" cy="208" rx="10" ry="20" fill="#080705"/>
                <rect x="25" y="215" width="3" height="35" fill="#09080600" rx="1.5"/>
                <ellipse cx="26.5" cy="213" rx="8" ry="17" fill="#080705"/>
                <!-- Pohon-pohon siluet di kanan -->
                <rect x="368" y="205" width="4" height="45" fill="#09080600" rx="2"/>
                <ellipse cx="370" cy="202" rx="11" ry="22" fill="#07060400"/>
                <rect x="382" y="210" width="3" height="40" fill="#09080600" rx="1.5"/>
                <ellipse cx="383.5" cy="208" rx="8" ry="18" fill="#07060400"/>
                <!-- Overlay gradasi langit atas ke bawah -->
                <rect x="0" y="0" width="400" height="280" fill="url(#skyGrad)"/>
            </svg>
        </div>
        <div class="page-main-vignette"></div>

        <header>
            <div class="logo">VisEdit</div>
            <div class="nav-links">v0.0.9</div>
        </header>

        <main>
            <div class="btn-grid">

                <!-- 1. Pilih Foto -->
                <div class="glow-box">
                    <div class="card-btn" onclick="triggerUpload()">
                        <svg class="card-icon icon-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <div class="card-label">Pilih Foto</div>
                        <input type="file" id="file-input" accept="image/*" onchange="handleFile(this.files)">
                    </div>
                </div>

                <!-- 2. Gabungkan Foto -->
                <div class="glow-box">
                    <div class="card-btn" onclick="openMergePopup()">
                        <svg class="card-icon icon-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="3" width="8" height="7" rx="1.5"/>
                            <rect x="14" y="3" width="8" height="7" rx="1.5"/>
                            <rect x="8" y="14" width="8" height="7" rx="1.5"/>
                            <polyline points="6,10 12,14 18,10"/>
                        </svg>
                        <div class="card-label">Gabungkan<br>Foto</div>
                    </div>
                </div>

                <!-- 3. Bingkai Foto -->
                <div class="glow-box">
                    <div class="card-btn" onclick="handleBingkai()">
                        <svg class="card-icon icon-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <rect x="7" y="7" width="10" height="10" rx="1"/>
                        </svg>
                        <div class="card-label">Bingkai<br>Foto</div>
                    </div>
                </div>

                <!-- 4. Hapus Latar -->
                <div class="glow-box">
                    <div class="card-btn" onclick="handleHapusLatar()">
                        <svg class="card-icon icon-rose" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18M8 6V4h8v2"/>
                            <rect x="5" y="6" width="14" height="14" rx="2"/>
                            <path d="M10 11l4 4M14 11l-4 4"/>
                        </svg>
                        <div class="card-label">Hapus<br>Latar</div>
                    </div>
                </div>

            </div>

            <!-- ── BARU DIEDIT — 3 foto terbaru ── -->
            <div class="recent-divider" id="recent-divider" style="display:none"></div>
            <div class="recent-section" id="recent-section" style="display:none">
                <div class="recent-header">
                    <span class="recent-label">Baru Diedit</span>
                    <span class="recent-see-all" onclick="switchTab('gallery')">Lihat Semua</span>
                </div>
                <div class="recent-row" id="recent-row"></div>
            </div>

            <!-- Swipe hint -->
            <div class="swipe-hint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
                <span>GALERI</span>
            </div>
        </main>

        <!-- Bottom Nav — Edit & Galeri -->
        <nav class="bottom-nav">
            <div class="bottom-nav-item active-tab" id="tab-edit" onclick="switchTab('edit')">
                <div class="bottom-nav-dot"></div>
                <div class="bottom-nav-icon">
                    <!-- Edit icon -->
                    <svg viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </div>
                <div class="bottom-nav-label">Edit</div>
            </div>
            <div class="bottom-nav-divider"></div>
            <div class="bottom-nav-item" id="tab-gallery" onclick="switchTab('gallery')">
                <div class="bottom-nav-icon">
                    <!-- Gallery icon -->
                    <svg viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                </div>
                <div class="bottom-nav-label">Galeri</div>
            </div>
        </nav>

        <footer>&copy; 2026 VisEdit Studio</footer>
    </div>

    <!-- ============================
         PAGE 2 — GALERI HASIL EDIT
    ============================= -->
    <div class="page page-gallery">
        <header>
            <div class="gallery-back" onclick="goToMain()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
                Kembali
            </div>
            <div class="gallery-title">GALERI</div>
            <div class="nav-links" id="gallery-count">0 Foto</div>
        </header>

        <div class="gallery-body" id="galleryBody">
            <!-- diisi JS -->
        </div>

        <footer>&copy; 2026 VisEdit Studio</footer>
    </div>

</div><!-- end app-wrapper -->

<!-- ===== POPUP GABUNGKAN FOTO ===== -->
<div class="popup-overlay" id="mergePopup" onclick="closeOnOverlay(event)">
    <div class="popup-sheet">
        <div class="popup-title">GABUNGKAN FOTO</div>
        <div class="popup-options">

            <div class="popup-btn" onclick="selectMerge(2)">
                <div class="popup-btn-inner">
                    <div class="popup-btn-icon icon-bg-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#c9a96e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="4" width="9" height="16" rx="1.5"/><rect x="13" y="4" width="9" height="16" rx="1.5"/>
                        </svg>
                    </div>
                    <div>
                        <div class="popup-btn-label">Gabungkan 2 Foto</div>
                        <div class="popup-btn-sub">Pilih tepat 2 gambar</div>
                    </div>
                </div>
            </div>

            <div class="popup-btn" onclick="selectMerge(3)">
                <div class="popup-btn-inner">
                    <div class="popup-btn-icon icon-bg-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#c4a882" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="4" width="6" height="16" rx="1.5"/><rect x="9" y="4" width="6" height="16" rx="1.5"/><rect x="16" y="4" width="6" height="16" rx="1.5"/>
                        </svg>
                    </div>
                    <div>
                        <div class="popup-btn-label">Gabungkan 3 Foto</div>
                        <div class="popup-btn-sub">Pilih tepat 3 gambar</div>
                    </div>
                </div>
            </div>

            <div class="popup-btn" onclick="selectMerge(4)">
                <div class="popup-btn-inner">
                    <div class="popup-btn-icon icon-bg-4">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#d4987a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="9" height="9" rx="1.5"/><rect x="13" y="2" width="9" height="9" rx="1.5"/>
                            <rect x="2" y="13" width="9" height="9" rx="1.5"/><rect x="13" y="13" width="9" height="9" rx="1.5"/>
                        </svg>
                    </div>
                    <div>
                        <div class="popup-btn-label">Gabungkan 4 Foto</div>
                        <div class="popup-btn-sub">Pilih tepat 4 gambar</div>
                    </div>
                </div>
            </div>

        </div>

        <div class="popup-close" onclick="closeMergePopup()">✕ &nbsp;Tutup</div>
    </div>
</div>

<!-- ===== LAYAR PILIH FOTO (PHASE 1) ===== -->
<div id="merge-pick">
    <header>
        <div class="editor-back" onclick="closeMergePick()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
            Batal
        </div>
        <div class="editor-title" id="pick-title">PILIH FOTO</div>
        <div style="width:48px"></div>
    </header>

    <div class="pick-body">
        <div class="pick-info" id="pick-info">Ketuk slot untuk memilih foto</div>
        <div class="pick-slots" id="pick-slots">
            <!-- dirender JS -->
        </div>
    </div>

    <div class="pick-actions">
        <button class="btn-pick-batal" onclick="closeMergePick()">Batal</button>
        <button class="btn-pick-gabung" id="btn-gabung" onclick="doGabung()">Gabungkan →</button>
    </div>
</div>

<!-- ===== LAYAR EDIT GABUNGAN (PHASE 2) ===== -->
<div id="merge-editor">
    <header>
        <div class="editor-back" onclick="backToPickFromEditor()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
            Ubah Foto
        </div>
        <div class="editor-title">EDIT GABUNGAN</div>
        <div style="width:64px"></div>
    </header>

    <div class="editor-preview">
        <canvas id="preview-canvas"></canvas>
        <div id="editor-loading">
            <div class="spinner"></div>
        </div>
    </div>

    <!-- Style selector -->
    <div class="style-section">
        <div class="style-section-label">Gaya Gabungan</div>
        <div class="style-scroll" id="styleScroll">
            <div class="style-chip active" data-style="side-by-side" onclick="selectStyle(this)">Sejajar</div>
            <div class="style-chip" data-style="grid" onclick="selectStyle(this)">Grid</div>
            <div class="style-chip" data-style="collage" onclick="selectStyle(this)">Kolase</div>
            <div class="style-chip" data-style="diagonal" onclick="selectStyle(this)">Diagonal</div>
            <div class="style-chip" data-style="polaroid" onclick="selectStyle(this)">Polaroid</div>
            <div class="style-chip" data-style="film" onclick="selectStyle(this)">Film Strip</div>
        </div>
    </div>

    <!-- Action buttons -->
    <div class="editor-actions">
        <button class="btn-buang" onclick="discardMergeEditor()">Buang</button>
        <button class="btn-simpan" onclick="saveMergeToGallery()">Simpan ke Galeri</button>
    </div>
</div>

<!-- Hidden inputs -->
<input type="file" id="slot-input" accept="image/*" style="display:none" onchange="handleSlotFile(this)">
<input type="file" id="hapus-latar-input" accept="image/*" style="display:none" onchange="handleHapusLatarFile(this.files)">

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
    /* ========================
       GALERI — localStorage
    ======================== */
    let savedPhotos = JSON.parse(localStorage.getItem('visedit_gallery') || '[]');

    function saveGallery() {
        localStorage.setItem('visedit_gallery', JSON.stringify(savedPhotos));
    }

    function addToGallery(dataURL, label) {
        savedPhotos.unshift({ id: Date.now(), dataURL, label, date: new Date().toLocaleDateString('id-ID') });
        saveGallery();
        renderGallery();
        renderRecent();
    }

    function deleteFromGallery(id) {
        savedPhotos = savedPhotos.filter(p => p.id !== id);
        saveGallery();
        renderGallery();
        renderRecent();
    }

    function renderGallery() {
        const body = document.getElementById('galleryBody');
        const count = document.getElementById('gallery-count');
        count.textContent = savedPhotos.length + ' Foto';

        if (savedPhotos.length === 0) {
            body.innerHTML = `
                <div class="gallery-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p>Belum ada foto tersimpan.<br>Edit foto lalu simpan disini.</p>
                </div>`;
            return;
        }

        body.innerHTML = `<div class="gallery-grid">${
            savedPhotos.map((p, idx) => `
                <div class="gallery-item" onclick="openLightbox(${idx})">
                    <img src="${p.dataURL}" alt="${p.label}" loading="lazy">
                    <div class="gallery-item-label">${p.label}</div>
                    <div class="gallery-item-del" onclick="event.stopPropagation();deleteFromGallery(${p.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </div>
                </div>`).join('')
        }</div>`;
    }

    renderGallery();

    /* ========================
       RECENT PHOTOS — tampilkan 3 foto terbaru di halaman utama
    ======================== */
    function renderRecent() {
        const sec     = document.getElementById('recent-section');
        const divider = document.getElementById('recent-divider');
        const row     = document.getElementById('recent-row');
        if (!sec || !row) return;
        const recent = savedPhotos.slice(0, 3);
        if (recent.length === 0) {
            sec.style.display = 'none';
            if (divider) divider.style.display = 'none';
            return;
        }
        sec.style.display = 'block';
        if (divider) divider.style.display = 'block';
        row.innerHTML = recent.map(p => `
            <div class="recent-thumb" onclick="openLightboxAtId(${p.id})" title="${p.label}">
                <img src="${p.dataURL}" alt="${p.label}" loading="lazy">
            </div>`
        ).join('');
    }

    function openLightboxAtId(id) {
        const idx = savedPhotos.findIndex(p => p.id === id);
        if (idx >= 0) openLightbox(idx);
    }

    renderRecent();

    /* ========================
       SWIPE NAVIGASI — GPU-optimized
       Gunakan pointer events supaya
       lebih responsif di mobile
    ======================== */
    const wrapper = document.getElementById('app-wrapper');
    let touchStartX = 0;
    let touchStartY = 0;
    let isGallery = false;
    let isSwiping = false;

    document.addEventListener('touchstart', e => {
        // Jangan intercept kalau di dalam editor atau popup atau lightbox
        if (document.getElementById('merge-editor').classList.contains('active')) return;
        if (document.getElementById('mergePopup').classList.contains('active')) return;
        if (document.getElementById('lightbox').classList.contains('active')) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (document.getElementById('merge-editor').classList.contains('active')) return;
        if (document.getElementById('lightbox').classList.contains('active')) return;
        if (!isSwiping) {
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
                isSwiping = true;
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (document.getElementById('merge-editor').classList.contains('active')) return;
        if (document.getElementById('mergePopup').classList.contains('active')) return;
        if (document.getElementById('lightbox').classList.contains('active')) return;
        if (!isSwiping) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
        if (Math.abs(dx) > 55 && Math.abs(dx) > dy * 1.3) {
            if (dx < 0 && !isGallery) goToGallery();
            else if (dx > 0 && isGallery) goToMain();
        }
        isSwiping = false;
    }, { passive: true });

    function goToGallery() {
        isGallery = true;
        wrapper.classList.add('show-gallery');
        document.getElementById('tab-gallery').classList.add('active-tab');
        document.getElementById('tab-gallery').querySelector('svg').setAttribute('stroke', '#c9a96e');
        document.getElementById('tab-edit').classList.remove('active-tab');
        document.getElementById('tab-edit').querySelector('svg').setAttribute('stroke', '#6b7280');
    }
    function goToMain() {
        isGallery = false;
        wrapper.classList.remove('show-gallery');
        document.getElementById('tab-edit').classList.add('active-tab');
        document.getElementById('tab-edit').querySelector('svg').setAttribute('stroke', '#c9a96e');
        document.getElementById('tab-gallery').classList.remove('active-tab');
        document.getElementById('tab-gallery').querySelector('svg').setAttribute('stroke', '#6b7280');
    }

    /* ========================
       BOTTOM NAV TAB SWITCH
    ======================== */
    function switchTab(tab) {
        if (tab === 'gallery') goToGallery();
        else goToMain();
    }

    /* ========================
       FILE PILIH FOTO
    ======================== */
    function triggerUpload() {
        document.getElementById('file-input').click();
    }
    function handleFile(files) {
        if (!files || files.length === 0) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = e => {
            addToGallery(e.target.result, 'Foto · ' + file.name.split('.')[0]);
            showToast('Foto berhasil disimpan ke Galeri!');
        };
        reader.readAsDataURL(file);
    }

    /* ========================
       POPUP GABUNGKAN
    ======================== */
    let mergeTarget = 2;

    function openMergePopup() {
        document.getElementById('mergePopup').classList.add('active');
    }
    function closeMergePopup() {
        document.getElementById('mergePopup').classList.remove('active');
    }
    function closeOnOverlay(e) {
        if (e.target.id === 'mergePopup') closeMergePopup();
    }

    function selectMerge(count) {
        closeMergePopup();
        mergeTarget = count;
        openMergePick(count);
    }

    /* ========================
       PHASE 1 — PICK SLOTS
       Satu slot = satu file input
       Tidak pakai multiple, jadi
       pasti bisa pilih 1 foto per slot
    ======================== */
    let slotImages = [];      // Array<{img: HTMLImageElement, dataURL: string} | null>
    let activeSlotIdx = -1;   // slot mana yang sedang dipilih

    function openMergePick(count) {
        slotImages = Array(count).fill(null);
        activeSlotIdx = -1;

        // Update title
        document.getElementById('pick-title').textContent = `PILIH ${count} FOTO`;
        document.getElementById('pick-info').textContent =
            `Ketuk setiap slot untuk memilih foto (${count} foto)`;

        renderPickSlots();
        updateGabungBtn();
        document.getElementById('merge-pick').classList.add('active');
    }

    function closeMergePick() {
        document.getElementById('merge-pick').classList.remove('active');
        slotImages = [];
        activeSlotIdx = -1;
    }

    function renderPickSlots() {
        const container = document.getElementById('pick-slots');
        const n = slotImages.length;
        container.innerHTML = '';
        slotImages.forEach((slot, i) => {
            const filled = slot !== null;
            const div = document.createElement('div');
            div.className = 'pick-slot' + (filled ? ' filled' : '');
            div.dataset.idx = i;
            div.innerHTML = `
                <img class="pick-slot-img" src="${filled ? slot.dataURL : ''}" alt="">
                <div class="pick-slot-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    <div class="pick-slot-num">Foto ${i + 1}</div>
                </div>
                <div class="pick-slot-overlay">
                    <div class="pick-slot-change">Ganti</div>
                </div>
                <div class="pick-slot-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>`;
            div.addEventListener('click', () => triggerSlotPick(i));
            container.appendChild(div);
        });
    }

    function triggerSlotPick(idx) {
        activeSlotIdx = idx;
        const inp = document.getElementById('slot-input');
        inp.value = '';
        inp.click();
    }

    function handleSlotFile(input) {
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                slotImages[activeSlotIdx] = { img, dataURL: e.target.result };
                renderPickSlots();
                updateGabungBtn();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
        input.value = '';
    }

    function updateGabungBtn() {
        const btn = document.getElementById('btn-gabung');
        const allFilled = slotImages.length > 0 && slotImages.every(s => s !== null);
        btn.classList.toggle('ready', allFilled);
    }

    function doGabung() {
        if (!slotImages.every(s => s !== null)) return;
        // Tutup pick, buka editor
        document.getElementById('merge-pick').classList.remove('active');
        mergeImages = slotImages.map(s => s.img);
        openMergeEditorFull();
    }

    /* ========================
       PHASE 2 — MERGE EDITOR
    ======================== */
    let mergeImages = [];
    let currentStyle = 'side-by-side';

    function openMergeEditorFull() {
        currentStyle = 'side-by-side';
        document.querySelectorAll('.style-chip').forEach(c => c.classList.remove('active'));
        document.querySelector('.style-chip[data-style="side-by-side"]').classList.add('active');
        document.getElementById('merge-editor').classList.add('active');
        showEditorLoading(true);
        // Render setelah browser selesai paint editor
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                renderMergePreview();
                showEditorLoading(false);
            });
        });
    }

    function backToPickFromEditor() {
        // Kembali ke pick agar user bisa ganti foto
        document.getElementById('merge-editor').classList.remove('active');
        document.getElementById('merge-pick').classList.add('active');
    }

    function discardMergeEditor() {
        document.getElementById('merge-editor').classList.remove('active');
        mergeImages = [];
        currentStyle = 'side-by-side';
        slotImages = [];
        const canvas = document.getElementById('preview-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function showEditorLoading(show) {
        const el = document.getElementById('editor-loading');
        if (show) el.classList.add('active');
        else el.classList.remove('active');
    }

    /* ========================
       STYLE SELECTOR
    ======================== */
    function selectStyle(chip) {
        document.querySelectorAll('.style-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentStyle = chip.dataset.style;
        if (mergeImages.length > 0) {
            showEditorLoading(true);
            requestAnimationFrame(() => {
                renderMergePreview();
                showEditorLoading(false);
            });
        }
    }

    /* ========================
       RENDER PREVIEW KE CANVAS
    ======================== */
    function renderMergePreview() {
        const canvas = document.getElementById('preview-canvas');
        const ctx = canvas.getContext('2d');
        const imgs = mergeImages;
        const n = imgs.length;
        const GAP = 8;

        if (currentStyle === 'side-by-side') {
            const H = 800;
            const widths = imgs.map(i => Math.round(i.naturalWidth * H / i.naturalHeight));
            const totalW = widths.reduce((a,b) => a+b, 0) + GAP*(n-1);
            canvas.width = totalW; canvas.height = H;
            ctx.clearRect(0,0,totalW,H);
            let x = 0;
            imgs.forEach((img, i) => {
                ctx.drawImage(img, x, 0, widths[i], H);
                x += widths[i] + GAP;
            });

        } else if (currentStyle === 'grid') {
            const COLS = n <= 2 ? n : 2;
            const ROWS = Math.ceil(n / COLS);
            const CELL = 600;
            canvas.width = COLS * CELL + GAP*(COLS-1);
            canvas.height = ROWS * CELL + GAP*(ROWS-1);
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0,0,canvas.width,canvas.height);
            imgs.forEach((img, i) => {
                const col = i % COLS, row = Math.floor(i / COLS);
                drawCover(ctx, img, col*(CELL+GAP), row*(CELL+GAP), CELL, CELL);
            });

        } else if (currentStyle === 'collage') {
            const H = 900, W = 1200;
            canvas.width = W; canvas.height = H;
            ctx.fillStyle = '#111118';
            ctx.fillRect(0,0,W,H);
            if (n === 1) {
                drawCover(ctx, imgs[0], 0, 0, W, H);
            } else {
                const leftW = Math.round(W * 0.58);
                drawCover(ctx, imgs[0], 0, 0, leftW, H);
                const rightW = W - leftW - GAP;
                const cellH = Math.floor((H - GAP*(n-2)) / (n-1));
                for (let i=1; i<n; i++) {
                    drawCover(ctx, imgs[i], leftW+GAP, (i-1)*(cellH+GAP), rightW, cellH);
                }
            }

        } else if (currentStyle === 'diagonal') {
            const W = 1200, H = 800;
            canvas.width = W; canvas.height = H;
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0,0,W,H);
            const stripW = Math.ceil(W/n) + 60;
            const slant = 40;
            imgs.forEach((img, i) => {
                ctx.save();
                ctx.beginPath();
                const x1 = i*(W/n) - slant, x2 = (i+1)*(W/n) + slant;
                ctx.moveTo(x1,0); ctx.lineTo(x2,0);
                ctx.lineTo(x2-slant*0.5,H); ctx.lineTo(x1-slant*0.5,H);
                ctx.closePath(); ctx.clip();
                drawCover(ctx, img, x1-slant, 0, stripW+slant, H);
                ctx.restore();
            });
            for (let i=1; i<n; i++) {
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.fillRect(i*(W/n)-slant*0.25-1, 0, 3, H);
            }

        } else if (currentStyle === 'polaroid') {
            const PAD = 24, BOTTOM = 60, CELL = 500;
            const angles = [-6, 3, -4, 5];
            const W = n <= 2 ? n*340+60 : 800, H = n <= 2 ? 600 : 800;
            canvas.width = W; canvas.height = H;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0,0,W,H);
            imgs.forEach((img, i) => {
                const angle = (angles[i] || (i%2===0 ? -5 : 4)) * Math.PI/180;
                const px = n <= 2 ? 40+i*330 : (i%2)*370+40;
                const py = n <= 2 ? 60 : Math.floor(i/2)*280+40;
                ctx.save();
                ctx.translate(px+(CELL+PAD*2)/2, py+(CELL+PAD+BOTTOM)/2);
                ctx.rotate(angle);
                ctx.translate(-(CELL+PAD*2)/2, -(CELL+PAD+BOTTOM)/2);
                ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
                ctx.fillStyle = '#fff';
                ctx.beginPath(); roundRect(ctx, 0, 0, CELL+PAD*2, CELL+PAD+BOTTOM, 4); ctx.fill();
                ctx.shadowColor = 'transparent';
                drawCover(ctx, img, PAD, PAD, CELL, CELL);
                ctx.restore();
            });

        } else if (currentStyle === 'film') {
            const FH = 500, FW = 380, SPROCKET = 24, SP_H = 18, SP_W = 12;
            const totalW = n*FW+60, totalH = FH+SPROCKET*2;
            canvas.width = totalW; canvas.height = totalH;
            ctx.fillStyle = '#111'; ctx.fillRect(0,0,totalW,totalH);
            for (let k=0; k<Math.floor(totalW/30); k++) {
                ctx.fillStyle = '#222';
                ctx.beginPath(); roundRect(ctx, k*30+5, 4, SP_W, SP_H, 3); ctx.fill();
                ctx.beginPath(); roundRect(ctx, k*30+5, totalH-4-SP_H, SP_W, SP_H, 3); ctx.fill();
            }
            imgs.forEach((img, i) => {
                drawCover(ctx, img, 30+i*FW, SPROCKET, FW-20, FH);
            });
        }
    }

    function drawCover(ctx, img, x, y, w, h) {
        const scale = Math.max(w/img.naturalWidth, h/img.naturalHeight);
        const sw = w/scale, sh = h/scale;
        const sx = (img.naturalWidth-sw)/2, sy = (img.naturalHeight-sh)/2;
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
        ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
        ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
        ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
        ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
    }

    /* ========================
       SIMPAN DARI EDITOR
    ======================== */
    function saveMergeToGallery() {
        const canvas = document.getElementById('preview-canvas');
        if (!canvas.width) { showToast('Tidak ada gambar untuk disimpan.'); return; }
        const dataURL = canvas.toDataURL('image/jpeg', 0.92);
        const styleNames = {
            'side-by-side':'Sejajar','grid':'Grid','collage':'Kolase',
            'diagonal':'Diagonal','polaroid':'Polaroid','film':'Film Strip'
        };
        addToGallery(dataURL, `Gabung ${mergeImages.length} · ${styleNames[currentStyle]||currentStyle}`);
        showToast('Tersimpan ke Galeri!');
        discardMergeEditor();
    }

    /* ========================
       BINGKAI FOTO
    ======================== */
    function handleBingkai() {
        showToast('Fitur Bingkai Foto dalam pengembangan.');
    }

    /* ========================
       HAPUS LATAR
    ======================== */
    function handleHapusLatar() {
        document.getElementById('hapus-latar-input').value = '';
        document.getElementById('hapus-latar-input').click();
    }
    function handleHapusLatarFile(files) {
        if (!files || files.length === 0) return;
        showToast('Fitur Hapus Latar dalam pengembangan.');
    }

    /* ========================
       INTRO SPLASH
    ======================== */
    const splash = document.getElementById('intro-splash');
    setTimeout(() => { splash.classList.add('hidden'); }, 2500);

    /* ========================
       LIGHTBOX CAROUSEL
    ======================== */
    let lbIndex = 0;
    let lbDragging = false;
    let lbDragStartX = 0;
    let lbDragStartY = 0;
    let lbDragDeltaX = 0;
    let lbDragIsHoriz = null; // null=belum tahu, true=horiz, false=vertikal

    function openLightbox(startIdx) {
        lbIndex = startIdx;
        buildLightboxSlides();
        updateLightboxUI();
        document.getElementById('lightbox').classList.add('active');
        // Block main swipe saat lightbox terbuka
        lbAttachSwipe();
    }

    function closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        lbDetachSwipe();
    }

    function buildLightboxSlides() {
        const track = document.getElementById('lb-track');
        track.innerHTML = '';
        savedPhotos.forEach((p, i) => {
            const slide = document.createElement('div');
            slide.className = 'lightbox-slide';
            const img = document.createElement('img');
            // Lazy-load slide jauh: hanya load yang dekat index
            img.src = p.dataURL;
            img.alt = p.label;
            slide.appendChild(img);
            track.appendChild(slide);
        });
        // Set lebar track
        track.style.width = (savedPhotos.length * 100) + 'vw';
        positionTrack(false);
        buildDots();
    }

    function positionTrack(animate) {
        const track = document.getElementById('lb-track');
        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)';
        }
        track.style.transform = `translateX(${-lbIndex * 100}vw)`;
    }

    function buildDots() {
        const dots = document.getElementById('lb-dots');
        const n = savedPhotos.length;
        dots.innerHTML = '';
        if (n <= 1) return;
        // Maksimal 8 dot agar tidak penuh
        const show = Math.min(n, 8);
        for (let i = 0; i < show; i++) {
            const d = document.createElement('div');
            d.className = 'lb-dot' + (i === lbIndex ? ' active' : '');
            dots.appendChild(d);
        }
    }

    function updateLightboxUI() {
        const n = savedPhotos.length;
        document.getElementById('lb-dots').querySelectorAll('.lb-dot').forEach((d, i) => {
            d.classList.toggle('active', i === lbIndex);
        });
        document.getElementById('lightbox-counter').textContent = `${lbIndex + 1} / ${n}`;
        const p = savedPhotos[lbIndex];
        document.getElementById('lightbox-title').textContent = p ? p.label : '';
    }

    function lbGoTo(idx) {
        const n = savedPhotos.length;
        if (idx < 0 || idx >= n) return;
        lbIndex = idx;
        positionTrack(true);
        updateLightboxUI();
    }

    /* Swipe dalam lightbox — horizontal geser slide, tidak interferensi scroll vertikal */
    function lbAttachSwipe() {
        const wrap = document.getElementById('lb-track-wrap');
        wrap.addEventListener('touchstart', lbTouchStart, { passive: true });
        wrap.addEventListener('touchmove', lbTouchMove, { passive: false });
        wrap.addEventListener('touchend', lbTouchEnd, { passive: true });
    }
    function lbDetachSwipe() {
        const wrap = document.getElementById('lb-track-wrap');
        wrap.removeEventListener('touchstart', lbTouchStart);
        wrap.removeEventListener('touchmove', lbTouchMove);
        wrap.removeEventListener('touchend', lbTouchEnd);
    }
    function lbTouchStart(e) {
        lbDragging = true;
        lbDragStartX = e.touches[0].clientX;
        lbDragStartY = e.touches[0].clientY;
        lbDragDeltaX = 0;
        lbDragIsHoriz = null;
        document.getElementById('lb-track').style.transition = 'none';
    }
    function lbTouchMove(e) {
        if (!lbDragging) return;
        const dx = e.touches[0].clientX - lbDragStartX;
        const dy = e.touches[0].clientY - lbDragStartY;

        if (lbDragIsHoriz === null) {
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                lbDragIsHoriz = Math.abs(dx) > Math.abs(dy);
            }
        }
        if (lbDragIsHoriz === false) { lbDragging = false; return; }
        if (lbDragIsHoriz) {
            e.preventDefault(); // jangan scroll vertikal
            lbDragDeltaX = dx;
            const base = -lbIndex * window.innerWidth;
            document.getElementById('lb-track').style.transform =
                `translateX(${base + dx}px)`;
        }
    }
    function lbTouchEnd(e) {
        if (!lbDragging || !lbDragIsHoriz) { lbDragging = false; return; }
        lbDragging = false;
        const threshold = window.innerWidth * 0.28;
        if (lbDragDeltaX < -threshold) lbGoTo(lbIndex + 1);
        else if (lbDragDeltaX > threshold) lbGoTo(lbIndex - 1);
        else positionTrack(true); // snap balik
    }

    /* ========================
       POPUP PILIHAN UNDUH
    ======================== */
    let unduhFmt = 'jpeg';
    let unduhRes = 1;

    function openUnduhPopup() {
        document.getElementById('unduh-popup').classList.add('active');
    }
    function closeUnduhPopup() {
        document.getElementById('unduh-popup').classList.remove('active');
    }
    function closeUnduhOnOverlay(e) {
        if (e.target.id === 'unduh-popup') closeUnduhPopup();
    }

    function selectUnduhChip(el, type) {
        const row = type === 'fmt' ? 'unduh-format-row' : 'unduh-res-row';
        document.getElementById(row).querySelectorAll('.unduh-chip').forEach(c => c.classList.remove('selected'));
        el.classList.add('selected');
        if (type === 'fmt') unduhFmt = el.dataset.fmt;
        else unduhRes = parseFloat(el.dataset.res);
    }

    function doUnduh() {
        const p = savedPhotos[lbIndex];
        if (!p) return;

        const img = new Image();
        img.onload = () => {
            const w = Math.round(img.naturalWidth * unduhRes);
            const h = Math.round(img.naturalHeight * unduhRes);
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);

            const mimeMap = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
            const extMap  = { jpeg: 'jpg', png: 'png', webp: 'webp' };
            const quality = unduhFmt === 'png' ? undefined : 0.92;
            const dataURL = canvas.toDataURL(mimeMap[unduhFmt], quality);

            const a = document.createElement('a');
            a.href = dataURL;
            a.download = `visedit_${Date.now()}.${extMap[unduhFmt]}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            closeUnduhPopup();
            const resLabel = unduhRes === 1 ? 'Asli' : unduhRes === 2 ? 'HD 2×' : 'Hemat 50%';
            showToast(`Mengunduh ${extMap[unduhFmt].toUpperCase()} · ${resLabel}`);
        };
        img.src = p.dataURL;
    }

    /* ========================
       TOAST NOTIFIKASI
    ======================== */
    let toastTimer;
    function showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
    }
</script>
</body>
</html>
