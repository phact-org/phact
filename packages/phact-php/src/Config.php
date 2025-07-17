<?php

namespace Phact\Phact;

use Exception;

class Config
{
    private static ?string $phactRootPath;

    public static function getPhactRootPath(): string
    {
        if (self::$phactRootPath === null) {
            throw new Exception('Phact root path is not defined');
        }

        return realpath(self::$phactRootPath);
    }

    public static function setPhactRootPath(string $distPath): void
    {
        self::$phactRootPath = $distPath;
    }
}
