const suche = document.getElementById("suche");
const kategorienBox = document.getElementById("kategorien");
const jahrVonFeld = document.getElementById("jahrVon");
const jahrBisFeld = document.getElementById("jahrBis");
const sortierung = document.getElementById("sortierung");
const zuruecksetzen = document.getElementById("zuruecksetzen");
const zaehler = document.getElementById("zaehler");
const raster = document.getElementById("raster");

const FARBEN = {
"Bücher": "#f59e0b",
"Videospiele": "#a855f7",
"Rezepte": "#22c55e",
"Autos": "#ef4444",
"Länder": "#3b82f6",
};
const JAHR_SCHLUESSEL = ["Erscheinungsjahr", "Release-Jahr"];

let daten = [];
let aktiveKategorie = "Alle";

// Jahr eines Eintrags (oder null, wenn er keins hat)
function holeJahr(eintrag) {
for (const k of JAHR_SCHLUESSEL) {
if (k in eintrag.meta) return eintrag.meta[k];
}
return null;
}

// Daten laden
fetch("daten.json")
.then((antwort) => antwort.json())
.then((json) => {
daten = json;
baueKategorieKnoepfe();
anzeigen();
})
.catch(() => {
raster.innerHTML =
'<p class="nichts">daten.json konnte nicht geladen werden.</p>';
});

function baueKategorieKnoepfe() {
const namen = ["Alle", ...new Set(daten.map((e) => e.kategorie))];
kategorienBox.innerHTML = "";
namen.forEach((name) => {
const knopf = document.createElement("button");
knopf.type = "button";
knopf.className = "chip";
if (name === aktiveKategorie) knopf.className = "chip aktiv";
knopf.textContent = name;
knopf.addEventListener("click", () => {
aktiveKategorie = name;
baueKategorieKnoepfe();
anzeigen();
});
kategorienBox.appendChild(knopf);
});
}

function anzeigen() {
const text = suche.value.trim().toLowerCase();
const von = leseZahl(jahrVonFeld);
const bis = leseZahl(jahrBisFeld);

let liste = daten.filter((e) => {
if (aktiveKategorie !== "Alle") {
if (e.kategorie !== aktiveKategorie) return false;
}
if (text && !e.name.toLowerCase().includes(text)) return false;

if (von !== null || bis !== null) {
const jahr = holeJahr(e);
if (jahr === null) return false;
if (von !== null && jahr < von) return false;
if (bis !== null && jahr > bis) return false;
}
return true;
});

// Sortieren
const modus = sortierung.value;
liste.sort((a, b) => {
if (modus === "name") return a.name.localeCompare(b.name, "de");
const ja = holeJahr(a);
const jb = holeJahr(b);
if (ja === null && jb === null) {
return a.name.localeCompare(b.name, "de");
}
if (ja === null) return 1;
if (jb === null) return -1;
return modus === "jahrAuf" ? ja - jb : jb - ja;
});

let wort = " Einträge";
if (liste.length === 1) wort = " Eintrag";
zaehler.textContent = liste.length + wort;

if (liste.length === 0) {
raster.innerHTML = '<p class="nichts">Nichts gefunden.</p>';
return;
}
raster.innerHTML = liste.map(baueKarte).join("");
}

function leseZahl(feld) {
if (feld.value === "") return null;
return Number(feld.value);
}

function baueZeile(k, w) {
return (
'<div class="zeile">' +
"<span>" + k + "</span>" +
"<span>" + formatiere(k, w) + "</span>" +
"</div>"
);
}

function formatiere(schluessel, wert) {
if (typeof wert !== "number") return wert;
// Jahre ohne Punkt anzeigen
if (schluessel.includes("Jahr")) return String(wert);
return wert.toLocaleString("de-DE", { maximumFractionDigits: 5 });
}

function baueKarte(e) {
const zeilen = Object.entries(e.meta)
.map(([k, w]) => baueZeile(k, w))
.join("");
const farbe = FARBEN[e.kategorie] || "#4f8cff";
return `
<article class="karte" style="--akzent:${farbe}">
<span class="kategorie">${e.kategorie}</span>
<h2>${e.name}</h2>
${zeilen}
</article>`;

}



suche.addEventListener("input", anzeigen);

jahrVonFeld.addEventListener("input", anzeigen);

jahrBisFeld.addEventListener("input", anzeigen);

sortierung.addEventListener("change", anzeigen);



zuruecksetzen.addEventListener("click", () => {

  suche.value = "";

  jahrVonFeld.value = "";

  jahrBisFeld.value = "";

  sortierung.value = "name";

  aktiveKategorie = "Alle";

  baueKategorieKnoepfe();

  anzeigen();

});

