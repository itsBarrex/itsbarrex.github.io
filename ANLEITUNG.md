# Anleitung — so bringst du die Seite online

Diese Anleitung ist für den ersten Start: aus dem ZIP wird ein GitHub-Repository,
das sich selbst veröffentlicht. Du brauchst dafür **keinen Server, keinen
Account bei einem Hoster und keinen API-Key.**

Danach gilt: **Änderung committen und pushen → Seite aktualisiert sich selbst.**

Alles Technische darüber hinaus steht auf Englisch in der [README.md](README.md).

---

## Was du brauchst

- Ein **GitHub-Konto** (`itsBarrex`).
- **Git** — <https://git-scm.com/downloads>
- **Node.js 22 oder neuer** — <https://nodejs.org> · brauchst du nur, wenn du die
  Seite lokal ansehen willst. Für das Veröffentlichen baut GitHub selbst.

---

## Schritt 1 — ZIP entpacken

Entpacke das ZIP in einen Ordner, in dem es bleiben darf, zum Beispiel
`C:\Projekte\itsbarrex-tools`.

Im Ordner liegen unter anderem `package.json`, `README.md` und diese Datei. Es
ist **kein** `node_modules` und **kein** `.git` dabei — das ist richtig so, beides
entsteht in den nächsten Schritten.

---

## Schritt 2 — Repository auf GitHub anlegen

Auf <https://github.com/new>:

- **Repository name:** `itsbarrex.github.io`
- **Public**
- **Kein** README, **kein** .gitignore, **keine** Lizenz anhaken — die Dateien
  bringen wir gleich selbst mit.

### Warum genau dieser Name

Ein Repository, das `<dein-benutzername>.github.io` heißt, ist bei GitHub ein
**User-Pages-Repository**. Es wird direkt unter `https://itsbarrex.github.io/`
ausgeliefert. Damit passt die Einstellung `BASE_HREF: /`, die schon im Projekt
steht, und du musst nichts anpassen.

Wenn du das Repository **anders** nennen willst, etwa `tools`, dann läuft die
Seite unter `https://itsbarrex.github.io/tools/` — und du **musst** eine Zeile
ändern, sonst bleibt die Seite weiß. Siehe
[Problem: die Seite ist weiß](#problem-die-seite-ist-weiß) unten.

---

## Schritt 3 — Code hochladen

Terminal (PowerShell oder Git Bash) im entpackten Ordner öffnen und der Reihe
nach:

```bash
git init
git add .
git commit -m "itsBarrex tools site"
git branch -M main
git remote add origin https://github.com/itsBarrex/itsbarrex.github.io.git
git push -u origin main
```

Nach dem Push liegt der Code auf GitHub. Die Seite ist noch **nicht** online —
dafür fehlt Schritt 4.

---

## Schritt 4 — GitHub Pages einschalten

Das ist der Schritt, der am leichtesten untergeht. Ohne ihn läuft alles grün
durch und trotzdem ist nichts zu sehen.

1. Im Repository auf **Settings** (oben rechts).
2. Links im Menü auf **Pages**.
3. Bei **Source** von *Deploy from a branch* auf **GitHub Actions** umstellen.

Das war die einzige Einstellung.

---

## Schritt 5 — Erste Veröffentlichung abwarten

1. Im Repository auf den Tab **Actions**.
2. Dort läuft **Deploy to GitHub Pages**. Ein Durchlauf dauert ungefähr zwei bis
   drei Minuten.
3. Wenn der Haken grün ist: <https://itsbarrex.github.io/> aufrufen.

Lief kein Workflow? Dann einmal auf **Deploy to GitHub Pages** in der linken
Spalte und rechts auf **Run workflow** klicken.

**Fertig.** Ab hier veröffentlicht sich die Seite bei jedem Push auf `main`
selbst, zusätzlich alle 6 Stunden, und auf Knopfdruck über **Run workflow**.

---

## Schritt 6 — Ein Tool auf die Seite bringen

Du fügst Tools **nicht** in diesem Repository hinzu. Die Seite liest sie aus
deinen eigenen Repositories.

1. Geh in das Repository des Tools (das muss **public** sein).
2. Rechts bei **About** auf das Zahnrad.
3. Bei **Topics** eintragen:
   - **`barrex-tool`** — das ist der Schalter. Ohne dieses Topic erscheint das
     Repository nicht auf der Seite.
   - dazu optional **`streamerbot`**, **`obs`** oder **`app`** für den Typ, der
     auf der Karte steht. Ohne Angabe steht dort „Tool“.
4. Speichern.

Beim nächsten Durchlauf steht das Tool auf der Seite. Sofort sehen? Im
Seiten-Repository unter **Actions → Deploy to GitHub Pages → Run workflow**.

### Version, Datum, Changelog und Download

Die kommen aus den **Releases** des Tool-Repositories — automatisch. Du
veröffentlichst dort ein Release, hängst die `.zip` oder `.exe` als Asset an, und
die Seite zeigt Version, Datum, die Release-Notes als Changelog und einen
Download-Button, der auf dein Asset zeigt.

**Schreib eine Versionsnummer nirgends von Hand hin.** Sie wäre beim nächsten
Release falsch und würde Besucher anlügen.

Noch kein Release? Dann steht auf der Karte „Noch kein Release“ und es wird auf
den Quellcode verlinkt. Das ist ein vorgesehener Zustand, kein Fehler.

### Eigene Texte für ein Tool

Willst du für ein Tool richtige deutsche Beschreibung, Systemvoraussetzungen und
eine Installationsanleitung, dann leg im **Tool-Repository** eine Datei
`tool.json` in den Hauptordner. Als Vorlage kopierst du
[`tool.json.example`](tool.json.example) aus diesem Projekt.

Die Datei ist optional: ohne sie nimmt die Seite die Repository-Beschreibung und
den ersten Absatz der README. Ein frisches Repository sieht also auch ohne
`tool.json` ordentlich aus.

---

## Texte auf der Seite ändern

Drei Dateien, mehr nicht:

| Was | Datei |
| --- | --- |
| Alle Beschriftungen, deutsch **und** englisch | `src/app/i18n/strings.ts` |
| Links, Handles, Social-Buttons, Seitentitel | `src/app/content/site.ts` |
| Tool-Texte von Hand, Platzhalter | `src/app/content/tools.ts` |

Text zwischen den Anführungszeichen ändern, Anführungszeichen und Kommas stehen
lassen, dann:

```bash
git add .
git commit -m "Texte angepasst"
git push
```

Zwei bis drei Minuten später ist es live.

> **Wichtig:** In diesen Dateien darf **niemals** ein Passwort, ein Token oder ein
> API-Key stehen. Alles daraus wird öffentlich mit der Seite veröffentlicht.

### Jede Beschriftung braucht beide Sprachen

`strings.ts` hat einen deutschen und einen englischen Block. Fügst du oben etwas
hinzu und unten nicht, **schlägt der Build fehl** und die Seite wird nicht
veröffentlicht. Das ist Absicht: besser ein roter Haken bei Actions als ein
englisches Wort mitten auf der deutschen Seite.

---

## Das solltest du noch erledigen

Wir haben Platzhalter eingebaut, damit die Seite vollständig aussieht, bevor
alle Inhalte da sind. Suche in den Dateien nach **`PLACEHOLDER`**. Konkret:

- **Der Absatz „Was ist das hier“** in `strings.ts` — in deinem Ton geschrieben,
  aber unsere Worte. Schreib ihn um.
- **Die Phantom-Mirror-Texte** in `tools.ts` — dito. Und sobald es ein
  öffentliches Repository dafür gibt, setz das Topic `barrex-tool` darauf; dann
  füllen sich Version und Download von selbst.
- **Die zwei Einträge, die mit `Beispiel:` anfangen**, in `tools.ts`. Die sind
  nur Füllmaterial, damit das Raster nicht leer ist, und tragen sichtbar den
  Hinweis „noch kein echtes Tool“. **Lösch sie, sobald du zwei echte Tools mit
  Topic hast.**

---

## Lokal ansehen (optional)

```bash
npm install
npm start
```

Dann <http://localhost:4200/> öffnen. `npm test` prüft die Seite, wie GitHub es
auch tut.

---

## Wenn etwas nicht klappt

### Problem: die Seite ist weiß

Fast immer die Einstellung `BASE_HREF`, und zwar dann, wenn das Repository
**nicht** `itsbarrex.github.io` heißt.

Öffne `.github/workflows/deploy.yml` und suche:

```yaml
env:
  BASE_HREF: /
```

| Repository heißt | BASE_HREF muss sein |
| --- | --- |
| `itsbarrex.github.io` | `/` |
| eigene Domain, z. B. `tools.barrex.stream` | `/` |
| `tools` | `/tools/` |
| `mein-repo` | `/mein-repo/` |

Der Schrägstrich am Anfang **und** am Ende muss stehen. Ändern, committen,
pushen — der nächste Durchlauf korrigiert es.

### Problem: bei Actions läuft nichts / kein Tab „Actions“

Repository ist privat oder Actions ist deaktiviert. **Settings → Actions →
General → Allow all actions**. Ein User-Pages-Repository muss ohnehin public
sein, damit GitHub Pages es kostenlos ausliefert.

### Problem: grüner Haken, aber die Seite kommt nicht

Schritt 4 fehlt: **Settings → Pages → Source = GitHub Actions**. Danach einmal
**Run workflow**.

### Problem: der Durchlauf ist rot

Bei **Actions** auf den roten Durchlauf und auf den fehlgeschlagenen Schritt
klicken — dort steht die Ursache im Klartext. Die häufigste ist eine
Beschriftung, die nur in einer Sprache existiert (siehe oben). Solange ein
Durchlauf rot ist, bleibt **die alte Version online**. Ein Fehler nimmt die Seite
also nie vom Netz.

### Problem: mein Tool erscheint nicht

Der Reihe nach prüfen:

1. Ist das Tool-Repository **public**?
2. Steht das Topic **`barrex-tool`** wirklich darauf (Tippfehler zählen nicht)?
3. Ist seit dem Setzen ein Durchlauf gelaufen? Sonst **Run workflow** drücken.

### Problem: das Tool-Raster ist leer

Dann hat kein Repository das Topic und die Beispiel-Einträge sind schon gelöscht.
Die Seite zeigt dafür bewusst eine Karte „Noch keine Tools veröffentlicht“ mit
Discord-Link — kaputt ist nichts.

---

## Eigene Domain (optional, später)

Willst du die Seite unter `tools.barrex.stream` laufen lassen:

1. **Settings → Pages → Custom domain**, Domain eintragen, speichern. GitHub legt
   dabei selbst eine `CNAME`-Datei im Repository an.
2. Beim DNS-Anbieter der Domain einen **CNAME**-Eintrag von `tools` auf
   `itsbarrex.github.io` setzen.
3. `BASE_HREF` bleibt `/`.
4. **Enforce HTTPS** anhaken, sobald GitHub das Zertifikat ausgestellt hat (kann
   ein paar Minuten dauern).

---

## Fragen

Bei Fragen zum Code oder wenn etwas nicht läuft: melde dich bei
[Vegapunk](https://barrex.stream).
