<?php
/*
Plugin Name: React Offer Form Mailer
Description: REST API Endpoint für React-Formular, sendet HTML-E-Mail 
Version: 1.4
Author: TTech-Application - MrTakkaT
*/

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/send-offer', array(
        'methods' => 'POST',
        'callback' => 'custom_send_offer_mail',
        'permission_callback' => '__return_true'
    ));
});

function custom_send_offer_mail(WP_REST_Request $request) {
    // Kundendaten
    $firstName = sanitize_text_field($request->get_param('firstName'));
    $lastName  = sanitize_text_field($request->get_param('lastName'));
    $email     = sanitize_email($request->get_param('email'));

    // Adresse
    $address = $request->get_param('address');
    $street  = isset($address['street']) ? sanitize_text_field($address['street']) : '';
    $zip     = isset($address['zip']) ? sanitize_text_field($address['zip']) : '';
    $city    = isset($address['city']) ? sanitize_text_field($address['city']) : '';

    // Türmatten-Array
    $doorMats = $request->get_param('doorMats');
    $total_price = 0;
    $doorMatsRows = '';
    $attachments = [];

    if (is_array($doorMats)) {
        foreach ($doorMats as $index => $mat) {
            $length = floatval($mat['length']);
            $width  = floatval($mat['width']);
            $shape  = sanitize_text_field($mat['shape']);
            $isSpecialShape = filter_var($mat['isSpecialShape'], FILTER_VALIDATE_BOOLEAN) ? 'Ja' : 'Nein';
            $amount = intval($mat['amount']);
            $price  = floatval($mat['price']);
            $total_price += $price;

            // Logo Upload
            $logo_url = '';
            $logo_field = "doorMats_{$index}_logo";
            if (!empty($_FILES[$logo_field]['name'])) {
                require_once(ABSPATH . 'wp-admin/includes/file.php');
                require_once(ABSPATH . 'wp-admin/includes/media.php');
                require_once(ABSPATH . 'wp-admin/includes/image.php');

                $allowed_types = ['image/jpeg', 'image/png'];
                if (!in_array($_FILES[$logo_field]['type'], $allowed_types)) {
                    return new WP_Error('invalid_file_type', 'Nur JPG und PNG erlaubt', ['status' => 400]);
                }
                if ($_FILES[$logo_field]['size'] > 5 * 1024 * 1024) {
                    return new WP_Error('file_too_large', 'Maximale Dateigröße: 5MB', ['status' => 400]);
                }

                $attachment_id = media_handle_upload($logo_field, 0);
                if (!is_wp_error($attachment_id)) {
                    $logo_url = wp_get_attachment_url($attachment_id);
                    $attachments[] = get_attached_file($attachment_id);
                }
            }

            $doorMatsRows .= '<tr>
                <td>' . esc_html($length) . ' m</td>
                <td>' . esc_html($width) . ' m</td>
                <td>' . esc_html($shape) . '</td>
                <td>' . esc_html($isSpecialShape) . '</td>
                <td>' . esc_html($amount) . '</td>
                <td>' . number_format($price, 2, ',', '.') . ' €</td>
                <td>' . ($logo_url ? '<img src="' . esc_url($logo_url) . '" style="max-width:100px;border:1px solid #ccc;padding:3px;"/>' : '—') . '</td>
            </tr>';
        }
    }

    // HTML-Mail
    $message = '
    <html>
    <body style="font-family:Arial, sans-serif; line-height:1.5;">
        <h2>Neue Fußmatten-Anfrage</h2>

        <h3>Kundendaten</h3>
        <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;">
            <tr><td><strong>Vorname</strong></td><td>' . esc_html($firstName) . '</td></tr>
            <tr><td><strong>Nachname</strong></td><td>' . esc_html($lastName) . '</td></tr>
            <tr><td><strong>E-Mail</strong></td><td>' . esc_html($email) . '</td></tr>
            <tr><td><strong>Adresse</strong></td><td>' . esc_html($street) . ', ' . esc_html($zip) . ' ' . esc_html($city) . '</td></tr>
        </table>

        <h3>Bestellte Fußmatten</h3>
        <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;">
            <tr>
                <th>Länge (cm) </th>
                <th>Breite (cm) </th>
                <th>Form</th>
                <th>Spezialform</th>
                <th>Menge</th>
                <th>Preis</th>
                <th>Logo</th>
            </tr>
            ' . $doorMatsRows . '
            <tr>
                <td colspan="5" style="text-align:right;"><strong>Gesamt</strong></td>
                <td colspan="2"><strong>' . number_format($total_price, 2, ',', '.') . ' €</strong></td>
            </tr>
        </table>
    </body>
    </html>
    ';

    $headers = [
        'Content-Type: text/html; charset=UTF-8',
        'From: Angebotsformular <no-reply@' . $_SERVER['SERVER_NAME'] . '>'
    ];

    $to = 'HIER.MUSS.DEINE.EMAIL.REIN@gmail.com'; // Empfänger anpassen (die '' müssen bleiben!)
    $subject = 'Neue Fußmatten-Anfrage';            // Betreff ändern

    if (wp_mail($to, $subject, $message, $headers, $attachments)) {
        return ['success' => true, 'message' => 'E-Mail gesendet'];
    } else {
        return new WP_Error('mail_failed', 'Mail konnte nicht gesendet werden', ['status' => 500]);
    }
}

// MUSS GESPEICHERT WERDEN in "/wp-content/plugins/react-offer-form-mailer/"
// Aktivieren Sie das Plugin in WordPress, um den REST-API-Endpunkt zu registrieren