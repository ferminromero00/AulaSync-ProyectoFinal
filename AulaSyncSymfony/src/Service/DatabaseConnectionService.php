<?php

namespace App\Service;

use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;

class DatabaseConnectionService
{
    private $entityManager;
    private $isTransactionActive = false;
    private $transactionTimeout = 5; // 5 segundos máximo por transacción
    
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }
    
    public function getConnection(): Connection
    {
        $connection = $this->entityManager->getConnection();
        
        if (!$connection->isConnected()) {
            $connection->connect();
        }
        
        // Configura el timeout para la conexión
        $connection->executeQuery("SET SESSION wait_timeout=5");
        
        return $connection;
    }
    
    public function beginTransaction()
    {
        if (!$this->isTransactionActive) {
            $this->getConnection()->beginTransaction();
            $this->isTransactionActive = true;
        }
    }
    
    public function commit()
    {
        if ($this->isTransactionActive) {
            try {
                $this->getConnection()->commit();
            } finally {
                $this->isTransactionActive = false;
                $this->closeConnection(); // Cerrar la conexión después de commit
            }
        }
    }
    
    public function rollback()
    {
        if ($this->isTransactionActive) {
            $this->getConnection()->rollBack();
            $this->isTransactionActive = false;
        }
    }
    
    public function closeConnection()
    {
        if ($this->isTransactionActive) {
            $this->rollback();
        }
        
        $connection = $this->entityManager->getConnection();
        if ($connection->isConnected()) {
            $connection->close();
        }
    }
}
