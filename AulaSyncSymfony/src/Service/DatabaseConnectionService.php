<?php

namespace App\Service;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class DatabaseConnectionService
{
    private $entityManager;
    private $isTransactionActive = false;
    private $transactionTimeout = 5;
    private $logger;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->logger = $logger;
    }
    
    public function getConnection(): Connection
    {
        try {
            $connection = $this->entityManager->getConnection();
            
            if (!$connection->isConnected()) {
                $this->logger->debug('Estableciendo nueva conexión a la base de datos');
                $connection->connect();
            }
            
            // Configurar timeouts más estrictos y verificar conexión activa
            $connection->executeStatement("SET SESSION wait_timeout=60");
            $connection->executeStatement("SET SESSION interactive_timeout=60");
            $connection->executeStatement("SET SESSION net_write_timeout=30");
            $connection->executeStatement("SET SESSION net_read_timeout=30");
            
            return $connection;
        } catch (\Exception $e) {
            $this->logger->error('Error al obtener conexión: ' . $e->getMessage());
            throw $e;
        }
    }
    
    public function beginTransaction()
    {
        try {
            if ($this->isTransactionActive) {
                $this->logger->warning('Intentando iniciar una transacción cuando ya hay una activa');
                return;
            }
            
            $connection = $this->getConnection();
            if ($connection->isTransactionActive()) {
                $this->logger->warning('La conexión ya tiene una transacción activa');
                $connection->commitTransactionAsync();
            }
            
            $this->logger->debug('Iniciando nueva transacción');
            $connection->beginTransaction();
            $this->isTransactionActive = true;
        } catch (\Exception $e) {
            $this->logger->error('Error al iniciar transacción: ' . $e->getMessage());
            $this->rollback();
            throw $e;
        }
    }
    
    public function commit()
    {
        if (!$this->isTransactionActive) {
            $this->logger->warning('Intentando hacer commit sin transacción activa');
            return;
        }

        try {
            $this->logger->debug('Iniciando commit de la transacción');
            $this->getConnection()->commit();
            $this->logger->debug('Commit completado exitosamente');
        } catch (\Exception $e) {
            $this->logger->error('Error durante commit: ' . $e->getMessage());
            $this->rollback();
            throw $e;
        } finally {
            $this->isTransactionActive = false;
            $this->closeConnection();
        }
    }
    
    public function rollback()
    {
        if (!$this->isTransactionActive) {
            return;
        }

        try {
            $this->logger->debug('Iniciando rollback de la transacción');
            $this->getConnection()->rollBack();
            $this->logger->debug('Rollback completado exitosamente');
        } catch (\Exception $e) {
            $this->logger->error('Error durante rollback: ' . $e->getMessage());
        } finally {
            $this->isTransactionActive = false;
            $this->closeConnection();
        }
    }
    
    public function closeConnection()
    {
        try {
            $connection = $this->entityManager->getConnection();
            
            if ($this->isTransactionActive) {
                $this->logger->warning('Cerrando conexión con transacción activa - forzando rollback');
                $this->rollback();
            }
            
            if ($connection->isConnected()) {
                $this->logger->debug('Cerrando conexión a la base de datos');
                try {
                    // Asegurar que no hay transacciones pendientes
                    if ($connection->isTransactionActive()) {
                        $connection->rollBack();
                    }
                    $connection->close();
                    $this->entityManager->clear();
                    $this->logger->debug('Conexión cerrada exitosamente');
                } catch (\Exception $e) {
                    $this->logger->error('Error al cerrar la conexión: ' . $e->getMessage());
                }
            }
        } catch (\Exception $e) {
            $this->logger->error('Error general al cerrar la conexión: ' . $e->getMessage());
        }
    }
    
    public function __destruct()
    {
        if ($this->isTransactionActive || 
            ($this->entityManager->getConnection()->isConnected() && 
             $this->entityManager->getConnection()->isTransactionActive())) {
            $this->logger->warning('Destructor llamado con transacción activa');
            $this->closeConnection();
        }
    }
}
