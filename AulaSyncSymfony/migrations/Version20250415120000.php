<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250415120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Añade código único a las clases';
    }

    public function up(Schema $schema): void
    {
        // Primero comprobamos si la columna ya existe
        $checkColumn = "SELECT COUNT(*) FROM information_schema.COLUMNS 
                       WHERE TABLE_SCHEMA = 'AulaSyncDatabase_letwateram' 
                       AND TABLE_NAME = 'clase' 
                       AND COLUMN_NAME = 'codigo_clase'";
        
        $columnExists = (bool) $this->connection->executeQuery($checkColumn)->fetchOne();

        if (!$columnExists) {
            // Si la columna no existe, la creamos
            $this->addSql('ALTER TABLE clase ADD codigo_clase VARCHAR(255) NULL');
            
            // Generamos códigos únicos para las clases existentes
            $this->addSql("UPDATE clase SET codigo_clase = CONCAT('CLS', LPAD(id, 6, '0'))");
            
            // Hacemos la columna NOT NULL y UNIQUE
            $this->addSql('ALTER TABLE clase MODIFY codigo_clase VARCHAR(255) NOT NULL');
            $this->addSql('CREATE UNIQUE INDEX UNIQ_199FACCE4A4CFDC3 ON clase (codigo_clase)');
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_199FACCE4A4CFDC3 ON clase');
        $this->addSql('ALTER TABLE clase DROP codigo_clase');
    }
}
