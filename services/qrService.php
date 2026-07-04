<?php

class QRService
{

    /**
     * Generate QR Code URL using third-party API
     */
    public static function generate($data)
    {

        $baseUrl = "https://api.qrserver.com/v1/create-qr-code/";

        // Encode data safely
        $encodedData = urlencode($data);

        // Build QR URL
        $qrUrl = $baseUrl . "?size=200x200&data=" . $encodedData;

        return $qrUrl;
    }
}
