<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250414104209 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE alumno (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, roles VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, update_at DATETIME NOT NULL, curso VARCHAR(255) DEFAULT NULL, matricula VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_1435D52D15DF1885 (matricula), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE alumno_curso (alumno_id INT NOT NULL, curso_id INT NOT NULL, INDEX IDX_66FE498EFC28E5EE (alumno_id), INDEX IDX_66FE498E87CB4A1F (curso_id), PRIMARY KEY(alumno_id, curso_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE clase (id INT AUTO_INCREMENT NOT NULL, profesor_id INT NOT NULL, nombre VARCHAR(255) NOT NULL, num_estudiantes INT NOT NULL, horario VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, INDEX IDX_199FACCEE52BD977 (profesor_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE curso (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE profesor (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, roles VARCHAR(255) NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, update_at DATETIME NOT NULL, especialidad VARCHAR(255) DEFAULT NULL, departamento VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', available_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', delivered_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE alumno_curso ADD CONSTRAINT FK_66FE498EFC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE alumno_curso ADD CONSTRAINT FK_66FE498E87CB4A1F FOREIGN KEY (curso_id) REFERENCES curso (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase ADD CONSTRAINT FK_199FACCEE52BD977 FOREIGN KEY (profesor_id) REFERENCES profesor (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE alumno_curso DROP FOREIGN KEY FK_66FE498EFC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE alumno_curso DROP FOREIGN KEY FK_66FE498E87CB4A1F
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase DROP FOREIGN KEY FK_199FACCEE52BD977
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE alumno
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE alumno_curso
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE clase
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE curso
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE profesor
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE messenger_messages
        SQL);
    }
}
