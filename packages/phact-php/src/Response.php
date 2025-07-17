<?php
namespace Phact\Phact;

class Response
{
    private string $body;
    private int $status;

    public function __construct($body = '', $status = 200)
    {
        $this->status = $status;
        $this->body = $body;
    }

    public function send(): void
    {
        http_response_code($this->status);
        echo $this->body;
    }
}
