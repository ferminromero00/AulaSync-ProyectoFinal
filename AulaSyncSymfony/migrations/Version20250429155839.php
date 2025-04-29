<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250429155839 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE anuncio (id INT AUTO_INCREMENT NOT NULL, clase_id INT NOT NULL, titulo VARCHAR(255) NOT NULL, contenido LONGTEXT NOT NULL, tipo VARCHAR(50) NOT NULL, fecha_creacion DATETIME NOT NULL, INDEX IDX_4B3BC0D49F720353 (clase_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio ADD CONSTRAINT FK_4B3BC0D49F720353 FOREIGN KEY (clase_id) REFERENCES clase (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio DROP FOREIGN KEY FK_4B3BC0D49F720353
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE anuncio
        SQL);
    }
}
