import { Request, Response } from "express";
import { ResourceController } from "../resource.controller";
import type { ResourceService } from "../../services";
import type { Resource } from "../../types";

describe("ResourceController", () => {
  let resourceController: ResourceController;
  let mockService: jest.Mocked<ResourceService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const mockResource: Resource = {
    id: "1",
    type: "oxygen",
    name: "Oxygen Supply",
    currentLevel: 5000,
    maxCapacity: 10000,
    unit: "kg",
    criticalThreshold: 20,
    warningThreshold: 40,
    consumptionRate: 100,
    lastUpdated: new Date(),
  };

  beforeEach(() => {
    mockService = {
      getAllResources: jest.fn(),
      getResourceById: jest.fn(),
      getResourceByType: jest.fn(),
      createResource: jest.fn(),
      updateResource: jest.fn(),
      deleteResource: jest.fn(),
      getResourceHistory: jest.fn(),
      getResourceStatus: jest.fn(),
      simulateConsumption: jest.fn(),
      calculateTrend: jest.fn(),
    } as any;

    resourceController = new ResourceController(mockService);

    mockRequest = {
      params: {},
      body: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe("getAll", () => {
    it("should return all resources", async () => {
      const resources = [mockResource];
      mockService.getAllResources.mockResolvedValue(resources);

      await resourceController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getAllResources).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(resources);
    });

    it("should handle errors", async () => {
      mockService.getAllResources.mockRejectedValue(
        new Error("Database error")
      );

      await resourceController.getAll(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Database error",
      });
    });
  });

  describe("getById", () => {
    it("should return a resource by id", async () => {
      mockRequest.params = { id: "1" };
      mockService.getResourceById.mockResolvedValue(mockResource);

      await resourceController.getById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.getResourceById).toHaveBeenCalledWith("1");
      expect(mockResponse.json).toHaveBeenCalledWith(mockResource);
    });

    it("should return 404 when resource not found", async () => {
      mockRequest.params = { id: "999" };
      mockService.getResourceById.mockRejectedValue(
        new Error("Resource with id 999 not found")
      );

      await resourceController.getById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe("create", () => {
    it("should create a new resource", async () => {
      mockRequest.body = {
        type: "water",
        name: "Water Supply",
        currentLevel: 3000,
        maxCapacity: 5000,
        unit: "L",
      };

      mockService.createResource.mockResolvedValue({
        ...mockResource,
        ...mockRequest.body,
      });

      await resourceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.createResource).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it("should handle validation errors", async () => {
      mockRequest.body = { invalid: "data" };
      mockService.createResource.mockRejectedValue(
        new Error("Validation failed")
      );

      await resourceController.create(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe("update", () => {
    it("should update a resource", async () => {
      mockRequest.params = { id: "1" };
      mockRequest.body = { currentLevel: 6000 };

      const updatedResource = { ...mockResource, currentLevel: 6000 };
      mockService.updateResource.mockResolvedValue(updatedResource);

      await resourceController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockService.updateResource).toHaveBeenCalledWith(
        "1",
        mockRequest.body
      );
      expect(mockResponse.json).toHaveBeenCalledWith(updatedResource);
    });

    it("should return 404 when updating non-existent resource", async () => {
      mockRequest.params = { id: "999" };
      mockRequest.body = { currentLevel: 6000 };
      mockService.updateResource.mockRejectedValue(
        new Error("Resource with id 999 not found")
      );

      await resourceController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });
});
