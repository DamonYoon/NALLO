/**
 * Mock for MinIO storage connection
 * Used in unit tests to isolate DocumentService from actual MinIO
 */

// In-memory storage for testing
const mockStorage = new Map<string, Buffer>();

export const uploadFile = jest.fn().mockImplementation(
  async (objectName: string, content: Buffer | string): Promise<string> => {
    const buffer = typeof content === 'string' ? Buffer.from(content) : content;
    mockStorage.set(objectName, buffer);
    return objectName;
  }
);

export const downloadFile = jest.fn().mockImplementation(
  async (objectName: string): Promise<Buffer> => {
    const content = mockStorage.get(objectName);
    if (!content) {
      throw new Error(`Object not found: ${objectName}`);
    }
    return content;
  }
);

export const deleteFile = jest.fn().mockImplementation(async (objectName: string): Promise<void> => {
  mockStorage.delete(objectName);
});

export const fileExists = jest.fn().mockImplementation(async (objectName: string): Promise<boolean> => {
  return mockStorage.has(objectName);
});

export const getPresignedUrl = jest.fn().mockImplementation(
  async (objectName: string): Promise<string> => {
    return `http://localhost:9000/nallo-files/${objectName}?signed=true`;
  }
);

export const initializeStorage = jest.fn().mockResolvedValue(undefined);
export const closeStorage = jest.fn().mockResolvedValue(undefined);
export const getStorageClient = jest.fn().mockReturnValue({});
export const getStorageStatus = jest.fn().mockResolvedValue({ connected: true });

// Helper to reset mock storage between tests
export const resetMockStorage = () => {
  mockStorage.clear();
  uploadFile.mockClear();
  downloadFile.mockClear();
  deleteFile.mockClear();
  fileExists.mockClear();
};

