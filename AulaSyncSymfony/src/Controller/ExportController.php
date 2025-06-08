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

/**
 * Controlador para exportar datos de clases y tareas en formato CSV.
 * Solo los profesores pueden exportar datos de sus propias clases o tareas.
 */
#[Route('/api/export')]
class ExportController extends AbstractController
{
    public function __construct(
        private CsvExportService $csvExportService,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Exporta los datos de una clase a un archivo CSV.
     * Solo el profesor propietario puede exportar la clase.
     *
     * @param Clase $clase La clase a exportar.
     * @return Response Archivo CSV descargable.
     */
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
            'clase-' . preg_replace('/[^a-zA-Z0-9]/', '-', $clase->getNombre()) . '-report.csv'
        );
        
        $response->headers->set('Content-Disposition', $disposition);
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        
        return $response;
    }

    /**
     * Exporta los datos de una tarea a un archivo CSV.
     * Solo el profesor propietario puede exportar la tarea.
     *
     * @param Tarea $tarea La tarea a exportar.
     * @return Response Archivo CSV descargable.
     */
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
