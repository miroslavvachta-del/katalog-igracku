// app.js - Kompletní logika vyhledávání, pětinásobného třídění a vykreslování katalogu

// Výchozí globální stav všech filtrů
let stavFiltru = {
  profese: "Vše",
  rarita: "Vše",
  era: "Vše",
  kategorie: "Vše",
  razeni: "vzestupne",
  dotaz: ""
};

// =================================================================
// 1. ZÁKLADNÍ VYHLEDÁVACÍ A FILTRAČNÍ FUNKCE
// =================================================================

function ziskejPodleProfese(profese) {
  return igracciData.filter(item => item.specifikace.profese === profese);
}

function seradOdNejstarsiho() {
  return [...igracciData].sort((a, b) => a.rokVydani - b.rokVydani);
}

function vyhledejIgracka(dotaz) {
  const hledanyText = dotaz.toLowerCase().trim();
  if (!hledanyText) return igracciData;

  return igracciData.filter(item => {
    const vNazvu = item.nazev.toLowerCase().includes(hledanyText);
    const vPopisu = item.popis.toLowerCase().includes(hledanyText);
    const vRarite = item.specifikace.rarita.toLowerCase().includes(hledanyText);
    const vProfesi = item.specifikace.profese.toLowerCase().includes(hledanyText);
    const vDoplnkach = item.doplnky.some(doplnek => doplnek.toLowerCase().includes(hledanyText));
    
    return vNazvu || vPopisu || vRarite || vProfesi || vDoplnkach;
  });
}

// =================================================================
// 2. HLAVNÍ FUNKCE PRO VYKRESLENÍ HTML KARET NA WEBU
// =================================================================

function vykresliIgracky(seznamIgracku) {
  const kontejner = document.getElementById("katalog");
  if (!kontejner) return;
  
  kontejner.innerHTML = ""; // Vyčištění starého obsahu

  if (seznamIgracku.length === 0) {
    kontejner.innerHTML = '<p class="chyba">Nebyly nalezeny žádné odpovídající figurky pro zvolenou kombinaci filtrů.</p>';
    return;
  }

  seznamIgracku.forEach(igracek => {
    // === DYNAMICKÉ URČENÍ BARVY A IKONY PODLE RARITY ===
    let barvaTextu = "#334155"; 
    let barvaPozadi = "#f8f9fa"; 
    let ikona = "📦";
    
    const raritaText = igracek.specifikace.rarita.toLowerCase();
    
    if (raritaText.includes("extrémne") || raritaText.includes("extrémní")) {
      barvaTextu = "#7c2d12"; 
      barvaPozadi = "#ffedd5"; 
      ikona = "💎";
    } else if (raritaText.includes("vysoká")) {
      barvaTextu = "#854d0e"; 
      barvaPozadi = "#fef9c3"; 
      ikona = "🥇";
    } else if (raritaText.includes("střední")) {
      barvaTextu = "#1e293b"; 
      barvaPozadi = "#e2e8f0"; 
      ikona = "🥈";
    } else if (raritaText.includes("běžná")) {
      barvaTextu = "#78350f"; 
      barvaPozadi = "#ffedd5"; 
      ikona = "🥉";
    } else if (raritaText.includes("nízká")) {
      barvaTextu = "#475569"; 
      barvaPozadi = "#f1f5f9"; 
      ikona = "📉";
    }

    // === BEZPEČNÁ ŠABLONA PRO NÁHRADNÍHO PANÁČKA ===
    const nahradniPanacekHtml = `
      <div class="nahradni-foto" style="width: 100%; height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; background: #f8f9fa; border-radius: 6px;">
        <span style="font-size: 3.5em; margin-bottom: 5px; display: block; line-height: 1;">👤</span>
        <span style="font-size: 0.82em; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Fotka bude dodána</span>
      </div>
    `;

    const karta = document.createElement("div");
    karta.className = "karta-igracka";

    // === DOKONALÁ GEOMETRICKÁ STRUKTURA KARTY S JASNÝMI TŘÍDAMI ===
 karta.innerHTML = `
      <!-- 1. HORNÍ BLOK (Pro obrázek, názvy a popis) -->
      <div class="karta-horni-sekce">
        <div class="foto-obal" style="text-align: center; background: #f8f9fa; padding: 10px; border-radius: 6px; min-height: 180px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
          
          <!-- Skrytý obrázek s bezpečnou kontrolou skrytí panáčka po úspěšném načtení -->
          <img src="${igracek.obrazek}" alt="${igracek.nazev}" style="max-width: 100%; max-height: 180px; object-fit: contain; display: none;" 
               onload="this.style.display='block'; const s = this.parentNode.querySelector('.nahradni-foto'); if(s) s.style.display='none';"
               onerror="this.style.display='none'; const s = this.parentNode.querySelector('.nahradni-foto'); if(s) s.style.display='flex';" />
        
        </div>
        <h3 style="margin: 12px 0 4px 0; font-size: 1.2em; color: #1e293b;">${igracek.nazev} <span style="font-size: 0.8em; color: #64748b; font-weight: normal;">(${igracek.rokVydani})</span></h3>
        <p style="font-size: 0.75em; color: #94a3b8; margin: 0 0 10px 0; font-family: monospace;">Katalog: ${igracek.katalogoveCislo} | ${igracek.kategorie}</p>
        <p style="font-size: 0.88em; line-height: 1.4; color: #334155; margin: 0 0 12px 0;">${igracek.popis}</p>
      </div>
      
      <!-- 2. SPODNÍ BLOK (Pro technické doplňky a štítek rarity napevno u dna) -->
      <div class="karta-spodni-sekce">
        <!-- TENTO DIV ZDE CHYBĚL A DRŽÍ SPRÁVNÉ ODSLAZENÍ TEXTU DOPLŇKŮ -->
        <div>
          <p style="margin: 2px 0;"><strong>Téma:</strong> ${igracek.specifikace.profese}</p>
          <p style="margin: 2px 0;"><strong>Éra:</strong> ${igracek.era}</p>
          <p style="margin: 2px 0;"><strong>Doplňky:</strong> ${igracek.doplnky.join(", ")}</p>
        </div>
        
        <p style="font-size: 0.85em; color: ${barvaTextu}; background: ${barvaPozadi}; padding: 10px 16px; margin: 12px 0 0 0; line-height: 1.3; border: 1px solid rgba(0,0,0,0.05); font-weight: bold;">
          ${ikona} Rarita: ${igracek.specifikace.rarita}
        </p>
      </div>
    `;

    // Najdeme políčko pro fotku a vložíme do něj náhradního panáčka hned na start
    const fotoObal = karta.querySelector(".foto-obal");
    if (fotoObal) {
      fotoObal.insertAdjacentHTML("afterbegin", nahradniPanacekHtml);
    }

    kontejner.appendChild(karta);
  });
}
// =================================================================
// 3. LOGICKÝ ENGINE - SPOJUJE VŠECH 5 TŘÍDĚNÍ DOHROMADY
// =================================================================

// Hlavní koordinátor – projde stavy všech tlačítek, spočítá výsledky a překreslí obrazovku
function aplikujFiltry() {
  let data = [...igracciData];

  // A. Třídění podle hlavní profese (Témata)
  if (stavFiltru.profese !== "Vše") {
    data = data.filter(item => item.specifikace.profese === stavFiltru.profese);
  }

  // B. Třídění podle sběratelské rarity
  if (stavFiltru.rarita !== "Vše") {
    data = data.filter(item => item.specifikace.rarita.includes(stavFiltru.rarita));
  }

  // C. Třídění podle historické éry
  if (stavFiltru.era !== "Vše") {
    data = data.filter(item => item.era === stavFiltru.era);
  }

  // D. Třídění podle široké kategorie produktu
  if (stavFiltru.kategorie !== "Vše") {
    data = data.filter(item => item.kategorie === stavFiltru.kategorie);
  }

  // Fulltextové vyhledávání v inputu (využívá vaši fulltext logiku)
  if (stavFiltru.dotaz !== "") {
    data = data.filter(item => {
      const vNazvu = item.nazev.toLowerCase().includes(stavFiltru.dotaz);
      const vPopisu = item.popis.toLowerCase().includes(stavFiltru.dotaz);
      const vRarite = item.specifikace.rarita.toLowerCase().includes(stavFiltru.dotaz);
      const vProfesi = item.specifikace.profese.toLowerCase().includes(stavFiltru.dotaz);
      const vDoplnkach = item.doplnky.some(d => d.toLowerCase().includes(stavFiltru.dotaz));
      return vNazvu || vPopisu || vRarite || vProfesi || vDoplnkach;
    });
  }

  // E. Chronologické řazení na časové ose
  if (stavFiltru.razeni === "vzestupne") {
    data.sort((a, b) => a.rokVydani - b.rokVydani);
  } else {
    data.sort((a, b) => b.rokVydani - a.rokVydani);
  }

  // Přefiltrovaná a srovnaná data pošleme k vykreslení
  vykresliIgracky(data);
}

// =================================================================
// 4. INTERAKTIVNÍ OVLÁDÁNÍ NAVÁZANÉ NA TLAČÍTKA V HTML
// =================================================================

function filtrZmen(typ, hodnota) {
  stavFiltru[typ] = hodnota;
  vizualneAktivujTlacitko(typ, hodnota);
  aplikujFiltry();
}

function razeniZmen(smer) {
  stavFiltru.razeni = smer;
  vizualneAktivujTlacitko('razeni', smer);
  aplikujFiltry();
}

// Funkce na přepínání vizuálních CSS souborů s neprůstřelnou pojistkou pro Body
function zmenStyl(cestaKStylem, tlacitko) {
  const linkStyl = document.getElementById("hlavni-styl");
  if (linkStyl) {
    linkStyl.href = cestaKStylem;
  }

  // Vyčistíme body od starých tříd stylů a zapíšeme tu správnou aktuální
  document.body.className = "";
  if (cestaKStylem.includes("helma")) {
    document.body.classList.add("styl-helma");
  } else if (cestaKStylem.includes("katalog")) {
    document.body.classList.add("styl-katalog");
  } else if (cestaKStylem.includes("policka")) { // DOPLNĚNO
    document.body.classList.add("styl-policka");
  } else if (cestaKStylem.includes("arkada")) {  // DOPLNĚNO
    document.body.classList.add("styl-arkada");
  } else {
    document.body.classList.add("styl-retro");
  }

  const tlacitkaVzhledu = document.querySelectorAll('.filtr-tlacitko[data-typ="vzhled"]');
  tlacitkaVzhledu.forEach(t => t.classList.remove('aktivni'));
  tlacitko.classList.add('aktivni');
}

// Pomocná vizuální funkce, která obarví vybrané tlačítko v menu na žluto/modro
function vizualneAktivujTlacitko(typ, hodnota) {
  const tlacitka = document.querySelectorAll(`.filtr-tlacitko[data-typ="${typ}"]`);
  tlacitka.forEach(tlacitko => {
    if (tlacitko.getAttribute('data-hodnota') === hodnota) {
      tlacitko.classList.add('aktivni');
    } else {
      tlacitko.classList.remove('aktivni');
    }
  });
}

// =================================================================
// 5. INICIALIZACE PO NAČTENÍ STRÁNKY A LOGIKA PRO KŘÍŽEK
// =================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Aktivujeme výchozí retro třídu na body hned při startu
  document.body.classList.add("styl-retro");

  // Vygenerujeme první kompletní časovou osu
  aplikujFiltry();

  const vyhledavac = document.getElementById("vyhledavani");
  const tlacitkoSmazat = document.getElementById("smazat-hledani");

  if (vyhledavac && tlacitkoSmazat) {
    // Sledování zápisu do vyhledávacího řádku
    vyhledavac.addEventListener("input", (e) => {
      const text = e.target.value;
      stavFiltru.dotaz = text.toLowerCase().trim();
      
      // Pokud políčko obsahuje text, rozsvítíme křížek, jinak ho schováme
      if (text.length > 0) {
        tlacitkoSmazat.style.display = "block";
      } else {
        tlacitkoSmazat.style.display = "none";
      }
      
      aplikujFiltry();
    });

    // Sledování kliknutí na mazací křížek (tlačítko x)
    tlacitkoSmazat.addEventListener("click", () => {
      vyhledavac.value = ""; // Vyčistíme text z inputu
      stavFiltru.dotaz = ""; // Vyčistíme text z logického enginu
      tlacitkoSmazat.style.display = "none"; // Schováme křížek
      vyhledavac.focus(); // Vrátí uživateli kurzor zpět k psaní
      aplikujFiltry(); // Obnovíme galerii do plného stavu
    });
  }
});

// Export pro případné použití v modulech (volitelné)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { stavFiltru, aplikujFiltry, filtrZmen, razeniZmen, zmenStyl };
}