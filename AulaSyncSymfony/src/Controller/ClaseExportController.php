<?php

namespace App\Controller;

use App\Entity\Clase;
use Doctrine\ORM\EntityManagerInterface;
use Knp\Snappy\Pdf;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ClaseExportController extends AbstractController
{
    #[Route('/api/clases/{id}/exportar-pdf', name: 'clase_exportar_pdf', methods: ['GET'])]
    public function exportarPdf($id, EntityManagerInterface $em, Pdf $knpSnappyPdf): Response
    {
        $clase = $em->getRepository(Clase::class)
            ->createQueryBuilder('c')
            ->leftJoin('c.alumnos', 'e')  // Cambiado de 'estudiantes' a 'alumnos'
            ->leftJoin('c.profesor', 'p')
            ->leftJoin('c.anuncios', 'a')
            ->where('c.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$clase) {
            return $this->json(['error' => 'Clase no encontrada'], 404);
        }

        $html = $this->renderView('clase/pdf_info.html.twig', [
            'clase' => $clase,
        ]);

        try {
            $tempDir = sys_get_temp_dir();
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0777, true);
            }

            $tempFile = tempnam($tempDir, 'pdf_');
            $pdfContent = $knpSnappyPdf->getOutputFromHtml($html);

            return new Response(
                $pdfContent,
                200,
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => sprintf('attachment; filename="clase_%s_info.pdf"', $id)
                ]
            );
        } catch (\Exception $e) {
            return $this->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
