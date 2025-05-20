<?php

namespace App\Controller;

use App\Entity\Clase;
use App\Entity\Tarea;
use App\Service\CsvExportService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/export')]
class ExportController extends AbstractController
{
    public function __construct(
        private CsvExportService $csvExportService,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/clase/{id}', name: 'export_clase')]
    public function exportClase(Clase $clase): Response
    {
        $this->denyAccessUnlessGranted('ROLE_PROFESOR');

        if ($clase->getProfesor() !== $this->getUser()) {
            throw $this->createAccessDeniedException('No puedes exportar datos de una clase que no es tuya');
        }

        $csv = $this->csvExportService->exportClaseToCSV($clase);
        
        $response = new Response($csv);
        $disposition = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            'clase-' . $clase->getId() . '-report.csv'
        );
        
        $response->headers->set('Content-Disposition', $disposition);
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        
        return $response;
    }

    #[Route('/tarea/{id}', name: 'export_tarea')]
    public function exportTarea(Tarea $tarea): Response
    {
        $this->denyAccessUnlessGranted('ROLE_PROFESOR');

        if ($tarea->getClase()->getProfesor() !== $this->getUser()) {
            throw $this->createAccessDeniedException('No puedes exportar datos de una tarea que no es tuya');
        }

        $csv = $this->csvExportService->exportTareaToCSV($tarea);
        
        $response = new Response($csv);
        $disposition = $response->headers->makeDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            'tarea-' . $tarea->getId() . '-report.csv'
        );
        
        $response->headers->set('Content-Disposition', $disposition);
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        
        return $response;
    }
}
