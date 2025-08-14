# React Eingabeformular + Wordpress Plugin

Hierbei handelt es sich um eine Kombination aus einem React Eingabeformular und einem Wordpress php Plugin welches die erhobenen Daten aus der Form im html Format als Email via Wordpress WP-MAil versendet.

Ich erkläre hier nur die Installation und den Workflow. Um das Formular selbst zu verändern setzte ich Kenntnisse in REACT und in PHP vorraus um beides in Kombination für sich selbst anzupassen.

Bei gewünschter Individueller Anpassung gerne eine Anfrage an MisterTakkaT@gmail.com - Alles ist möglich!

## Plugin

Das Plugin dient als API Endpunkt. Es nimmt die Daten aus dem Eingabeformular und verwandelt diese in ein HTML format und sendet es als email über den Wordpress WP-Mailer. (Dieser muss Eingerichtet sein)

Teste den WP-Mailer:
Wordpress Dashboard -> WP Mail SMTP -> Werkzeuge -> Email Test

Versuche eine Testmail an die Adresse die das Plugin erreichen soll zu senden. Funktioniert WP-Mail korrekt kann mit der Einrichtung des Plugins fortgesetzt werden. (Prüfe auch ob die Mail wirklich ankommt!)

### Einstellungen des Plugins

1. Das Plugin ist auf das vorliegende Eingabeformular ausgerichtet. Es ist in PHP geschrieben.
   Will man individuelle Formulardaten verarbeiten, muss natürlich die Datenverarbeitung des PlugIn angepasst werden!

2. Empfängermail anpassen.
   Im "react-offer-form-mailer.php" unter Zeile 120 die gewünschte Empfänger Email eintragen.

### Integration

Das Plugin "react-offer-form" beim Hostinganbieter speichern unter:

        "/wp-content/plugins/react-offer-form-mailer/"

im Anschluss sollte im Wordpress Dashboard unter Plugins dieses mit selbigem Namen auftauchen.

Plugin aktivieren.

fertig.

## React-Form

### Einstellungen der Form

Die Form kann beliebig angepasst werden. Die erhobenen Daten müssen am Ende natürlich vom Plugin verarbeiten können. Normaler REST-API Flow.

### build and save

Ein externes Hosten des build ist nicht möglich ohne die cors Einstellungen in Wordpress zu bearbeiten. Da es sich dabei um Sicherheitsrelevante Kommunikation handelt wird dringend empfohlen den build im Hostinganbieter der Wordpressseite zu speichern.

Das Projekt muss erst gebuildet werden dafür sowie nach jeglichen Änderungen in den Dateien unter /src folgendes im Terminal eingeben:

        npm run build

Ein neuer "dist" ordener wird damit erstellt. Dies ist der fertige Programmordner! Der "dist" kann umgenannt werden, aber der Inhalt MUSS seine struktur beibehalten !WICHTIG!

Den dist Ordner mit korrekter Auflösung beim Hostinganbieter speichern unter:

        "/wp-content/uploads/react-offer-form(der umgenannte dist)

Darunter sollte es wie folgt aussehen:

        index.html
        /assets ->
                    index-irgendwas.js
                    index-etwasAnderes.css

sollte der pfad aus irgendwelchen Gründen anders aussehen muss dieser auch im nachfolgenden iframe angepasst werden!

### Integration

Die React Form ist dafür gemacht als Html-Element in Wordpress/Elementor via iframe eingefügt zu werden.

Da die Form eine dynamische Höhe hat ist ein Observer integriert der dem Elternelement (dem Html-Element) bei Änderung seiner Höhe dessen Wert angibt. Dafür muss das Html- Element wie folgt integriert werden:

    -> Html-Element erstellen und im Codeblock Folgendes eintragen:

        <div id="iframe-container">
            <iframe id="react-iframe" src="/wp-content/uploads/react-offer-form/index.html" width="100%" style="border:0;"></iframe>
        </div>

        <script>
            const iframe = document.getElementById("react-iframe");

            window.addEventListener("message", (event) => {
                const offset = Number(event.data.height)+10

                if (event.data.type === "setHeight") {
                    iframe.style.height = offset + "px";
                    }
            });
        </script>

Die offset +10 entspricht eine Pixelangabe die der Wordpresscontainer höher sein sollte wie Sein Inhalt. Die 10 sind mindest Empfehlung um ein scrollcontainer zu vermeiden.

## weitere Informationen

Unter trash findet man die Datei:

    email_aus_Plugin_bsp.html

So sieht der Ihnalt der Email aus die das Plugin nach Eingabe ins Formular versendet.
Für eine schönere Optik muss inline style im Plugin eingefügt werden da das versendete Format html ist lässt sich dies mit css stylen.

    reqObject.json

Ein Beispiel des Datensatzes im json Format.
