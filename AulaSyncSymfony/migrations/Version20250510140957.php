<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250510140957 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE notificacion (id INT AUTO_INCREMENT NOT NULL, alumno_id INT NOT NULL, tipo VARCHAR(255) NOT NULL, contenido VARCHAR(255) NOT NULL, leida TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', referencia_id INT DEFAULT NULL, INDEX IDX_729A19ECFC28E5EE (alumno_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notificacion ADD CONSTRAINT FK_729A19ECFC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE notificacion DROP FOREIGN KEY FK_729A19ECFC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE notificacion
        SQL);
    }
}
