<?php

namespace App\Form;

use App\Entity\Alumno;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

/**
 * Formulario de registro para alumnos.
 * Permite registrar un nuevo alumno con email, contraseña, nombre, apellidos y documento PDF opcional.
 */
class AlumnoRegistroType extends AbstractType
{
    /**
     * Construye el formulario de registro de alumno.
     *
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class)
            ->add('plainPassword', PasswordType::class) 
            ->add('firstName', TextType::class)
            ->add('lastName', TextType::class)
            ->add('documento', FileType::class, [
                'label' => 'Documento (PDF, máx. 5MB)',
                'mapped' => false,
                'required' => false,
                'constraints' => [
                    new File([
                        'maxSize' => '5M',
                        'mimeTypes' => [
                            'application/pdf',
                        ],
                        'mimeTypesMessage' => 'Por favor sube un PDF válido',
                    ])
                ],
            ])
        ;
    }

    /**
     * Configura las opciones del formulario.
     *
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Alumno::class,
            'csrf_protection' => false,
            'allow_extra_fields' => true,
            'validation_groups' => ['registration']
        ]);
    }
}
