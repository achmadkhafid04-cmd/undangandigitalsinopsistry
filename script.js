const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlWDiyEMiI33We_roIrbYCruq3vmEYMBvLijxQw9Cmj3yMRBFsOOgSSS7R8DzkbrJD/exec";

const TARGET_DATE = new Date('February 15, 2026 08:00:00').getTime();

window.copyToClipboard = function(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const textToCopy = el.innerText || el.textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert(" Berhasil disalin: " + textToCopy))
            .catch(() => fallbackCopy(textToCopy));
    } else {
        fallbackCopy(textToCopy);
    }
};

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; 
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert(" Berhasil disalin: " + text);
    } catch (err) {
        alert("⚠️ Gagal menyalin otomatis. Silakan salin manual.");
    }
    document.body.removeChild(textArea);
}

function sanitize(string) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', "/": '&#x2F;' };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}


document.addEventListener('DOMContentLoaded', () => {

    loadComments();

    const music = document.getElementById('bg-music');
    const musicIcon = document.getElementById('music-control');
    let isPlaying = false;

    function toggleMusic() {
        if (isPlaying) {
            music.pause();
            musicIcon.classList.remove('spin');
            isPlaying = false;
        } else {
            music.play().then(() => {
                musicIcon.classList.add('spin');
                isPlaying = true;
            }).catch(e => console.log("Menunggu interaksi user"));
        }
    }
    if (musicIcon) musicIcon.addEventListener('click', toggleMusic);

    const urlParams = new URLSearchParams(window.location.search);
    const rawName = urlParams.get('to');
    const guestEl = document.getElementById('guest-name');
    const inputNama = document.getElementById('nama');
    
    if (rawName) {
        const cleanName = decodeURIComponent(rawName).replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if(guestEl) guestEl.innerText = cleanName;
        if(inputNama) inputNama.value = cleanName; 
    }

    const overlay = document.getElementById('overlay');
    const openBtn = document.getElementById('open-btn');
    if (openBtn && overlay) {
        openBtn.addEventListener('click', () => {
            toggleMusic();
            overlay.classList.add('slide-up');
            document.body.classList.remove('no-scroll');
            window.scrollTo(0, 0);
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 1200);
        });
    }

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    document.querySelectorAll('.animate-box').forEach(el => observer.observe(el));

    const timer = setInterval(() => {
        const now = new Date().getTime();
        const dist = TARGET_DATE - now;
        
        if (dist < 0) {
            clearInterval(timer);
            const box = document.getElementById('countdown-box');
            if(box) box.innerHTML = "<p style='font-size:1.5rem; letter-spacing:2px;'>ALHAMDULILLAH SAH</p>";
            return;
        }
        
        document.getElementById('days').innerText = Math.floor(dist / (1000 * 60 * 60 * 24));
        document.getElementById('hours').innerText = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        document.getElementById('minutes').innerText = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('seconds').innerText = Math.floor((dist % (1000 * 60)) / 1000);
    }, 1000);

    const giftModal = document.getElementById('gift-modal');
    const showGiftBtn = document.getElementById('show-gift-btn');
    const closeModalSpan = document.querySelector('.close-modal');

    if (showGiftBtn) showGiftBtn.addEventListener('click', () => { giftModal.style.display = 'flex'; });
    if (closeModalSpan) closeModalSpan.addEventListener('click', () => { giftModal.style.display = 'none'; });
    window.addEventListener('click', (e) => { if (e.target === giftModal) giftModal.style.display = 'none'; });

    const rsvpForm = document.getElementById('rsvp-form');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            
            const btnKirim = document.getElementById('btn-kirim');
            const originalText = btnKirim.innerText;
            
            btnKirim.innerText = "MENGIRIM...";
            btnKirim.disabled = true;
            btnKirim.style.opacity = "0.7";

            const nama = document.getElementById('nama').value;
            const ucapan = document.getElementById('ucapan').value;
            const status = document.getElementById('status').value;

            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('status', status);
            formData.append('ucapan', ucapan);

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if(data.result === 'success') {
                    alert(" Terima kasih! Konfirmasi dan doa Anda telah terkirim."); 
                    rsvpForm.reset(); 
                    
                    loadComments();
                } else {
                    throw new Error('Gagal menyimpan data');
                }
            })
            .catch(err => {
                console.error(err);
                alert("⚠️ Terjadi kesalahan koneksi, silakan coba lagi.");
            })
            .finally(() => {
                btnKirim.innerText = originalText;
                btnKirim.disabled = false;
                btnKirim.style.opacity = "1";
            });
        });
    }
});
function loadComments() {
    const container = document.getElementById('wishes-container');
    const spanHadir = document.getElementById('count-hadir');
    const spanTidak = document.getElementById('count-tidak');
    
    if (!container) return;

    container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Memuat doa & ucapan...</p>';

    fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
        container.innerHTML = '';
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Belum ada ucapan.</p>';
            if(spanHadir) spanHadir.innerText = "0";
            if(spanTidak) spanTidak.innerText = "0";
            return;
        }

        let totalHadir = 0;
        let totalTidak = 0;

        data.forEach(item => {
            let statusRaw = item.status ? item.status.toLowerCase().trim() : "";
            
            if ( (statusRaw.includes("hadir") || statusRaw === "ya") && 
                 !statusRaw.includes("tidak") && 
                 !statusRaw.includes("maaf") && 
                 !statusRaw.includes("belum") ) {
                totalHadir++;
            } else {
                totalTidak++;
            }

            let timeHTML = ""; 
            
            if (item.timestamp && item.timestamp !== "") {
                let dateObj = new Date(item.timestamp);
                if (!isNaN(dateObj.getTime())) {
                    let timeString = dateObj.toLocaleDateString("id-ID", {
                        day: 'numeric', month: 'short', year: 'numeric'
                    });
                    timeHTML = `<small class="wish-time">${timeString}</small>`;
                }
            }

            const newWish = document.createElement('div');
            newWish.classList.add('wish-card');
            
            newWish.innerHTML = `
                <div class="wish-header">
                    <span class="wish-name">${sanitize(item.nama)}</span>
                </div>
                <p class="wish-text">${sanitize(item.ucapan)}</p>
                ${timeHTML}
            `;
            
            container.appendChild(newWish);
        });

        if(spanHadir) spanHadir.innerText = totalHadir;
        if(spanTidak) spanTidak.innerText = totalTidak;

    })
    .catch(err => {
        console.error("Gagal memuat:", err);
        container.innerHTML = '<p style="text-align:center; color:red; padding:20px;">Gagal memuat data.</p>';
    });
}