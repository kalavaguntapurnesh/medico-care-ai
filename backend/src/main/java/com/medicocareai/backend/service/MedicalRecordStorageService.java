package com.medicocareai.backend.service;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Value;

@Service
public class MedicalRecordStorageService {

    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png");

    private final Path storageDirectory;

    public MedicalRecordStorageService(
            @Value("${app.storage.medical-records-dir}") String storageDirectory) {
        this.storageDirectory = Paths.get(storageDirectory).toAbsolutePath().normalize();
    }

    public StoredMedicalFile store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please select a file to upload");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 10 MB");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("Original filename is require");
        }

        // handling both windows and unix path seperators

        String safeOriginalName = originalFilename
                .replace('\\', '/');

        safeOriginalName = safeOriginalName.substring(
                safeOriginalName.lastIndexOf('/') + 1);

        int dotIndex = safeOriginalName.lastIndexOf('.');

        if (dotIndex <= 0 || dotIndex == safeOriginalName.length() - 1) {
            throw new IllegalArgumentException("file must have a supported extension");

        }

        String extension = safeOriginalName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Only PDF, JPG, JPEG and PNG files are allowed");
        }

        byte[] content = file.getBytes();

        String detectedMimeType = detectMimeType(content);

        if (detectedMimeType == null) {
            throw new IllegalArgumentException("The file content is invalid or unsupported");
        }

        boolean extensionMatches = (extension.equals("pdf")
                && detectedMimeType.equals("application/pdf"))
                || ((extension.equals("jpg") || extension.equals("jpeg"))
                        && detectedMimeType.equals("image/jpeg"))
                || (extension.equals("png")
                        && detectedMimeType.equals("image/png"));

        if (!extensionMatches) {
            throw new IllegalArgumentException("File extension does not match its content");
        }

        Files.createDirectories(storageDirectory);

        // we will never use client-supplied filename as storage name

        String storageFilename = UUID.randomUUID() + "." + extension;

        Path destination = storageDirectory.resolve(storageFilename).normalize();

        if (!destination.startsWith(storageDirectory)) {
            throw new IllegalArgumentException("Invalid storage path");
        }

        Files.write(
                destination,
                content,
                StandardOpenOption.CREATE_NEW,
                StandardOpenOption.WRITE);

        return new StoredMedicalFile(
                safeOriginalName,
                storageFilename,
                detectedMimeType,
                (long) content.length);

    }

    private String detectMimeType(byte[] content) {

        // for PDF
        if (content.length >= 5
                && content[0] == '%'
                && content[1] == 'P'
                && content[2] == 'D'
                && content[3] == 'F'
                && content[4] == '-') {
            return "application/pdf";
        }

        // for JPG

        if (content.length >= 3
                && (content[0] & 0xFF) == 0xFF
                && (content[1] & 0xFF) == 0xD8
                && (content[2] & 0xFF) == 0xFF) {
            return "image/jpeg";
        }

        // for PNG

        if (content.length >= 8
                && (content[0] & 0xFF) == 0x89
                && content[1] == 0x50
                && content[2] == 0x4E
                && content[3] == 0x47
                && content[4] == 0x0D
                && content[5] == 0x0A
                && content[6] == 0x1A
                && content[7] == 0x0A) {
            return "image/png";
        }

        return null;
    }

    public Path resolveStoredFile(String storageFilename) {

        if (storageFilename == null
                || !storageFilename.matches(
                        "[a-fA-F0-9-]{36}\\.(pdf|jpg|jpeg|png)")) {
            throw new IllegalArgumentException(
                    "Invalid stored filename");
        }

        Path resolvedPath = storageDirectory.resolve(storageFilename).normalize();

        if (!resolvedPath.startsWith(storageDirectory)) {
            throw new IllegalArgumentException(
                    "Invalid storage path");
        }

        return resolvedPath;
    }

    public record StoredMedicalFile(
            String originalFilename,
            String storageFilename,
            String mimeType,
            long fileSize) {

    }

    public Path getExistingFile(String storageFilename) throws IOException {
        Path filePath = resolveStoredFile(storageFilename);

        if (!Files.isRegularFile(filePath)) {
            throw new IOException("Medical record file not found");
        }

        return filePath;
    }

}
