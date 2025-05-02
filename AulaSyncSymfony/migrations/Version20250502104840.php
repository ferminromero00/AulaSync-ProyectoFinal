<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250502104840 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Añade campos para tareas en la tabla anuncio';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE anuncio ADD titulo VARCHAR(255) DEFAULT NULL, ADD fecha_entrega DATETIME DEFAULT NULL, ADD archivo_url VARCHAR(255) DEFAULT NULL, CHANGE tipo tipo VARCHAR(255) NOT NULL');
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio ADD CONSTRAINT FK_4B3BC0D414D45BBE FOREIGN KEY (autor_id) REFERENCES profesor (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_4B3BC0D414D45BBE ON anuncio (autor_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE anuncio DROP titulo, DROP fecha_entrega, DROP archivo_url, CHANGE tipo tipo VARCHAR(50) NOT NULL');
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio DROP FOREIGN KEY FK_4B3BC0D414D45BBE
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_4B3BC0D414D45BBE ON anuncio
        SQL);
    }
}
