<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250506180401 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE entrega_tarea (id INT AUTO_INCREMENT NOT NULL, alumno_id INT NOT NULL, tarea_id INT NOT NULL, archivo_url VARCHAR(255) DEFAULT NULL, comentario LONGTEXT DEFAULT NULL, fecha_entrega DATETIME NOT NULL, INDEX IDX_87CDD04CFC28E5EE (alumno_id), INDEX IDX_87CDD04C6D5BDFE1 (tarea_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea ADD CONSTRAINT FK_87CDD04CFC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea ADD CONSTRAINT FK_87CDD04C6D5BDFE1 FOREIGN KEY (tarea_id) REFERENCES anuncio (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea DROP FOREIGN KEY FK_87CDD04CFC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea DROP FOREIGN KEY FK_87CDD04C6D5BDFE1
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE entrega_tarea
        SQL);
    }
}
