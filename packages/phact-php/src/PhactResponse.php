<?php

namespace Phact\Phact;

class PhactResponse extends Response
{
    private array $props;
    private string $pageName;


    public function __construct(string $pageName, array $props)
    {
        $this->pageName = $pageName;
        $this->props = $props;

        [$body, $status] = $this->render();

        parent::__construct($body, $status);
    }

    private function render(): array
    {
        $component = strtoupper($this->pageName);
        $path = realpath(Config::getPhactRootPath() . "/dist/{$component}.php");

        if (!$path || !file_exists($path)) {
            return ['Page does not exist.', 404];
        }

        require_once $path;

        if (!function_exists($component)) {
            return ["Render function '{$component}' not found.", 500];
        }

        ob_start();
        $component($this->props);
        $body = ob_get_clean();

        return [$body, 200];
    }
}
