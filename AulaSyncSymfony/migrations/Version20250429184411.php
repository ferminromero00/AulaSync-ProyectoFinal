<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250429184411 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio ADD autor_id INT NOT NULL
        SQL);
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
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio DROP FOREIGN KEY FK_4B3BC0D414D45BBE
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_4B3BC0D414D45BBE ON anuncio
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio DROP autor_id
        SQL);
    }
}
