<?php

namespace App\Tests\Unit\Service;

use App\Service\FileUploader;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\AsciiSlugger;

class FileUploaderTest extends TestCase
{
    private $fileUploader;
    private $targetDirectory;

    protected function setUp(): void
    {
        $this->targetDirectory = sys_get_temp_dir();
        $this->fileUploader = new FileUploader($this->targetDirectory, new AsciiSlugger());
    }

    public function testUpload()
    {
        // Crear un archivo temporal de prueba
        $tempFile = tempnam(sys_get_temp_dir(), 'test_');
        file_put_contents($tempFile, 'test content');

        // Crear un UploadedFile simulado
        $file = new UploadedFile(
            $tempFile,
            'original.txt',
            'text/plain',
            null,
            true
        );

        // Probar el upload
        $fileName = $this->fileUploader->upload($file);

        // Verificaciones
        $this->assertNotEmpty($fileName);
        $this->assertFileExists($this->targetDirectory . '/' . $fileName);

        // Limpiar
        unlink($this->targetDirectory . '/' . $fileName);
    }

    public function testGetTargetDirectory()
    {
        $this->assertEquals($this->targetDirectory, $this->fileUploader->getTargetDirectory());
    }
}
