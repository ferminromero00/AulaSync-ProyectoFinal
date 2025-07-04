<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250614174322 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE alumno (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, roles JSON NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, update_at DATETIME NOT NULL, curso VARCHAR(255) DEFAULT NULL, matricula VARCHAR(255) DEFAULT NULL, profile_image VARCHAR(255) DEFAULT NULL, UNIQUE INDEX UNIQ_1435D52D15DF1885 (matricula), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE alumno_curso (alumno_id INT NOT NULL, curso_id INT NOT NULL, INDEX IDX_66FE498EFC28E5EE (alumno_id), INDEX IDX_66FE498E87CB4A1F (curso_id), PRIMARY KEY(alumno_id, curso_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE anuncio (id INT AUTO_INCREMENT NOT NULL, clase_id INT NOT NULL, autor_id INT NOT NULL, contenido LONGTEXT NOT NULL, tipo VARCHAR(255) NOT NULL, titulo VARCHAR(255) DEFAULT NULL, fecha_entrega DATETIME DEFAULT NULL, archivo_url VARCHAR(255) DEFAULT NULL, fecha_creacion DATETIME NOT NULL, INDEX IDX_4B3BC0D49F720353 (clase_id), INDEX IDX_4B3BC0D414D45BBE (autor_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE clase (id INT AUTO_INCREMENT NOT NULL, profesor_id INT NOT NULL, nombre VARCHAR(255) NOT NULL, num_estudiantes INT NOT NULL, created_at DATETIME NOT NULL, codigo_clase VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_199FACCE4A4CFDC3 (codigo_clase), INDEX IDX_199FACCEE52BD977 (profesor_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE clase_alumno (clase_id INT NOT NULL, alumno_id INT NOT NULL, INDEX IDX_61BDAF399F720353 (clase_id), INDEX IDX_61BDAF39FC28E5EE (alumno_id), PRIMARY KEY(clase_id, alumno_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE clase_estudiante (clase_id INT NOT NULL, alumno_id INT NOT NULL, INDEX IDX_6E1785139F720353 (clase_id), INDEX IDX_6E178513FC28E5EE (alumno_id), PRIMARY KEY(clase_id, alumno_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE curso (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE entrega_tarea (id INT AUTO_INCREMENT NOT NULL, alumno_id INT NOT NULL, tarea_id INT NOT NULL, archivo_url VARCHAR(255) DEFAULT NULL, comentario LONGTEXT DEFAULT NULL, fecha_entrega DATETIME NOT NULL, nota DOUBLE PRECISION DEFAULT NULL, comentario_correccion LONGTEXT DEFAULT NULL, INDEX IDX_87CDD04CFC28E5EE (alumno_id), INDEX IDX_87CDD04C6D5BDFE1 (tarea_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE invitacion (id INT AUTO_INCREMENT NOT NULL, alumno_id INT DEFAULT NULL, clase_id INT DEFAULT NULL, estado VARCHAR(20) NOT NULL, fecha DATETIME NOT NULL, INDEX IDX_3CD30E84FC28E5EE (alumno_id), INDEX IDX_3CD30E849F720353 (clase_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE notificacion (id INT AUTO_INCREMENT NOT NULL, alumno_id INT NOT NULL, tipo VARCHAR(255) NOT NULL, contenido LONGTEXT DEFAULT NULL, referencia_id INT DEFAULT NULL, created_at DATETIME NOT NULL, datos JSON DEFAULT NULL, mensaje LONGTEXT NOT NULL, INDEX IDX_729A19ECFC28E5EE (alumno_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE profesor (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, roles JSON NOT NULL, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, update_at DATETIME NOT NULL, especialidad VARCHAR(255) DEFAULT NULL, departamento VARCHAR(255) DEFAULT NULL, profile_image VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE registro_pendiente (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, codigo VARCHAR(6) NOT NULL, datos LONGTEXT NOT NULL, fecha_solicitud DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
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
            ALTER TABLE anuncio ADD CONSTRAINT FK_4B3BC0D49F720353 FOREIGN KEY (clase_id) REFERENCES clase (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio ADD CONSTRAINT FK_4B3BC0D414D45BBE FOREIGN KEY (autor_id) REFERENCES profesor (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase ADD CONSTRAINT FK_199FACCEE52BD977 FOREIGN KEY (profesor_id) REFERENCES profesor (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_alumno ADD CONSTRAINT FK_61BDAF399F720353 FOREIGN KEY (clase_id) REFERENCES clase (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_alumno ADD CONSTRAINT FK_61BDAF39FC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_estudiante ADD CONSTRAINT FK_6E1785139F720353 FOREIGN KEY (clase_id) REFERENCES clase (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_estudiante ADD CONSTRAINT FK_6E178513FC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea ADD CONSTRAINT FK_87CDD04CFC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea ADD CONSTRAINT FK_87CDD04C6D5BDFE1 FOREIGN KEY (tarea_id) REFERENCES anuncio (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion ADD CONSTRAINT FK_3CD30E84FC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion ADD CONSTRAINT FK_3CD30E849F720353 FOREIGN KEY (clase_id) REFERENCES clase (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notificacion ADD CONSTRAINT FK_729A19ECFC28E5EE FOREIGN KEY (alumno_id) REFERENCES alumno (id)
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
            ALTER TABLE anuncio DROP FOREIGN KEY FK_4B3BC0D49F720353
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE anuncio DROP FOREIGN KEY FK_4B3BC0D414D45BBE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase DROP FOREIGN KEY FK_199FACCEE52BD977
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_alumno DROP FOREIGN KEY FK_61BDAF399F720353
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_alumno DROP FOREIGN KEY FK_61BDAF39FC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_estudiante DROP FOREIGN KEY FK_6E1785139F720353
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE clase_estudiante DROP FOREIGN KEY FK_6E178513FC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea DROP FOREIGN KEY FK_87CDD04CFC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE entrega_tarea DROP FOREIGN KEY FK_87CDD04C6D5BDFE1
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion DROP FOREIGN KEY FK_3CD30E84FC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE invitacion DROP FOREIGN KEY FK_3CD30E849F720353
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE notificacion DROP FOREIGN KEY FK_729A19ECFC28E5EE
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE alumno
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE alumno_curso
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE anuncio
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE clase
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE clase_alumno
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE clase_estudiante
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE curso
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE entrega_tarea
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE invitacion
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE notificacion
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE profesor
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE registro_pendiente
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE messenger_messages
        SQL);
    }
}
