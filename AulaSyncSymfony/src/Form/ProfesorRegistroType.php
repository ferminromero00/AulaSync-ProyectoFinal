<?php

namespace App\Form;

use App\Entity\Profesor;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\File;

/**
 * Formulario de registro para profesores.
 * Permite registrar un nuevo profesor con email, contraseña, nombre, apellidos y foto de perfil opcional.
 */
class ProfesorRegistroType extends AbstractType
{
    /**
     * Construye el formulario de registro de profesor.
     *
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class) // Valida formato de email automáticamente
            ->add('plainPassword', PasswordType::class)
            ->add('firstName', TextType::class)
            ->add('lastName', TextType::class)
            ->add('profilePicture', FileType::class, [
                'label' => 'Foto de perfil (JPG o PNG, máx. 2MB)',
                'required' => false,
                'constraints' => [
                    new File([
                        'maxSize' => '2M',
                        'mimeTypes' => [
                            'image/jpeg',
                            'image/png',
                        ],
                        'mimeTypesMessage' => 'Por favor sube una imagen JPG o PNG válida',
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
            'data_class' => Profesor::class,
            'csrf_protection' => false,
            'allow_extra_fields' => true,
            'validation_groups' => ['registration']
        ]);
    }
}
