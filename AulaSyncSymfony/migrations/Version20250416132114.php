<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250416132114 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE invitacion (id INT AUTO_INCREMENT NOT NULL, alumno_id INT DEFAULT NULL, clase_id INT DEFAULT NULL, estado VARCHAR(20) NOT NULL, fecha DATETIME NOT NULL, INDEX IDX_3CD30E84FC28E5EE (alumno_id), INDEX IDX_3CD30E849F720353 (clase_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion ADD CONSTRAINT FK_3CD30E84FC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion ADD CONSTRAINT FK_3CD30E849F720353 FOREIGN KEY (clase_id) REFERENCES clase (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion DROP FOREIGN KEY FK_3CD30E84FC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion DROP FOREIGN KEY FK_3CD30E849F720353
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE invitacion
        SQL);
    }
}
