const suche = document.getElementById("suche");
const filter = document.getElementById("filter");
const vorschlaege = document.getElementById("vorschlaege");
const liste = document.getElementById("liste");
const ergebnis = document.getElementById("ergebnis");
let daten = [];
// Daten laden
fetch("daten.json")
.then((antwort) => antwort.json())
.then((json) => {
daten = json;
// Kategorien für das Filter-Menü sammeln
const kategorien = [...new Set(daten.map((e) => e.kategorie))];
kategorien.forEach((k) => {
const option = document.createElement("option");
option.value = k;
option.textContent = k;
filter.appendChild(option);
});
aktualisieren();
})
.catch(() => {
ergebnis.innerHTML = '<p class="nichts">daten.json konnte nicht geladen werden.</p>';
});
// Einträge der gewählten Kategorie
function gefilterteDaten() {
if (filter.value === "Alle") return daten;
return daten.filter((e) => e.kategorie === filter.value);
}
// Vorschlagsliste und Chips neu aufbauen
function aktualisieren() {
const eintraege = gefilterteDaten();
vorschlaege.innerHTML = "";
eintraege.forEach((e) => {
const option = document.createElement("option");
option.value = e.name;
vorschlaege.appendChild(option);

});
liste.innerHTML = "";
if (filter.value !== "Alle") {
eintraege.forEach((e) => {
const knopf = document.createElement("button");
knopf.className = "chip";
knopf.textContent = e.name;
knopf.addEventListener("click", () => {
suche.value = e.name;
zeigeKarte(e);
});
liste.appendChild(knopf);
});
}
suchen();
}
function suchen() {
const text = suche.value.trim().toLowerCase();
if (text === "") {
ergebnis.innerHTML = "";
return;
}
const eintraege = gefilterteDaten();
const treffer =
eintraege.find((e) => e.name.toLowerCase() === text) ||
eintraege.find((e) => e.name.toLowerCase().includes(text));
if (!treffer) {
ergebnis.innerHTML = '<p class="nichts">Nichts gefunden.</p>';
return;
}
zeigeKarte(treffer);
}
filter.addEventListener("change", aktualisieren);
suche.addEventListener("input", suchen);
function zeigeKarte(eintrag) {
const zeilen = Object.entries(eintrag.meta)
.map(([schluessel, wert]) =>
`<div class="zeile"><span>${schluessel}</span><span>${wert.toLocaleString("de-DE")}</span></div>`

)
.join("");
ergebnis.innerHTML = `
<div class="karte">
<span class="kategorie">${eintrag.kategorie}</span>
<h2>${eintrag.name}</h2>
${zeilen}
</div>`;
}